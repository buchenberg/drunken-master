'use strict';
require('dotenv').config();
require('hapijs-status-monitor');

const Glue = require('glue');
const Path = require('path');
const debug = require('debug')('server');
const Chalk = require('chalk');
const fetch = require('node-fetch');
const base64 = require('base-64');
const API = require('./lib/api.json');

const nyan = `
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::##############                              :::::::::::::::::::
############################  ##############################  :::::::::::::::::
#########################  ######???????????????????????######  :::::::::::::::
=========================  ####??????????()????()?????????####  :::::::::::::::
=========================  ##????()??????????????    ()?????##  ::::    :::::::
------------=============  ##??????????????????  ;;;;  ?????##  ::  ;;;;  :::::
-------------------------  ##??????????()??????  ;;;;;;?????##    ;;;;;;  :::::
-------------------------  ##??????????????????  ;;;;;;         ;;;;;;;;  :::::
++++++++++++-------------  ##??????????????????  ;;;;;;;;;;;;;;;;;;;;;;;  :::::
+++++++++++++++++++++++++  ##????????????()??  ;;;;;;;;;;;;;;;;;;;;;;;;;;;  :::
+++++++++++++++++    ;;;;  ##??()????????????  ;;;;;;@@  ;;;;;;;;@@  ;;;;;  :::
~~~~~~~~~~~~~++++;;;;;;;;  ##????????????????  ;;;;;;    ;;;  ;;;    ;;;;;  :::
~~~~~~~~~~~~~~~  ;;  ~~~~  ####??????()??????  ;;[];;;;;;;;;;;;;;;;;;;;;[]  :::
$$$$$$$$$$$$$~~~~  ~~~~~~  ######?????????????  ;;;;;;              ;;;;  :::::
$$$$$$$$$$$$$$$$$$$$$$$$$    ###################  ;;;;;;;;;;;;;;;;;;;;  :::::::
$$$$$$$$$$$$$$$$$$$$$$$  ;;;;                                       :::::::::::
:::::::::::::$$$$$$$$$$  ;;;;  ::  ;;  ::::::::::::  ;;  ::  ;;;;  ::::::::::::
:::::::::::::::::::::::      ::::::    :::::::::::::     ::::      ::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
`;


// Load environmental variables or suitable defaults
const environment = {
    tls: process.env.TLS || false,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5984,
        name: process.env.DB_NAME || 'oas',
        docname: process.env.DB_DOC_NAME || 'spec',
        admin: process.env.DB_ADMIN_NAME,
        password: process.env.DB_ADMIN_PASSWORD,
    },
    api: {
        host: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 9990,
    },
    ui: {
        host: process.env.UI_HOST || 'localhost',
        port: process.env.UI_PORT || 9990,
    },
    ws: {
        port: process.env.WS_PORT || 9991,
    },
    proxy: {
        upstream_host: process.env.PROXY_UPSTREAM_HOST,
        upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL,
        header_host: process.env.PROXY_HEADER_HOST,
    },

};

const manifest = {
    server: {},
    connections: [
        {
            host: environment.api.host,
            port: environment.api.port,
            labels: 'api',
            tls: environment.tls,
            routes: {
                cors: {
                    origin: ['*'],
                },
                files: {
                    relativeTo: Path.join(__dirname, 'lib/ui/build'),
                },
            },

        },
    ],
    registrations: [
        {
            plugin: 'h2o2',
        },
        {
            plugin: 'inert',
        },
        {
            plugin: 'vision',
        },
        {
            plugin: {
                register: 'hapijs-status-monitor',
                options: {
                    title: 'Figaro Server',
                    path: '/views/status',
                    routeConfig: {
                        auth: false,
                    },
                },
            },
        },
        {
            plugin: {
                register: './lib/proxy',
                options: {
                    upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL || 'https',
                    upstream_url: process.env.PROXY_UPSTREAM_HOST || 'public.dev-spectrum.net',
                    proxy_host_header: process.env.PROXY_HOST_HEADER || 'figaro.dev-spectrum.net',
                },
            },
        },
        {
            plugin: {
                register: './lib/mocks',
                options: {
                    db: {
                        host: environment.db.host,
                        port: environment.db.port,
                        name: environment.db.name,
                        document: environment.db.docname,
                        admin: environment.db.admin,
                        password: environment.db.password,
                    },
                    baseDir: Path.resolve('./lib/mocks'),
                    docspath: '/dapi/oas',
                },
            },
        },
        {
            plugin: {
                register: './lib/routes',
                options: {
                    db: {
                        host: environment.db.host,
                        port: environment.db.port,
                        name: environment.db.name,
                        document: environment.db.docname,
                        admin: environment.db.admin,
                        password: environment.db.password,
                    },
                    baseDir: Path.resolve('./lib/mocks'),
                    docspath: '/dapi/oas',
                    handlers: Path.resolve('./lib/mocks/handlers'),
                },
            },
        },
        {
            plugin: {
                register: './lib/ui',
                options: {
                    cors: {
                        origin: ['*'],
                    },
                },
            },
        },
    ],
};

const options = {
    relativeTo: __dirname,
};

const startServer = function() {
    Glue.compose(manifest, options, (err, server) => {
        if (err) {
            throw err;
        }

        let today = new Date();

        server.start(() => {
            server.plugins.mocks.setHost(server.info.host + ':' + server.info.port);
            debug(`${nyan}
                ** ${today.toTimeString()} **
                     Nyan! So much hapi.
                    `);
            debug(`Drunken Master is running on ${Chalk.cyan(Chalk.underline(server.info.uri))}`);
            debug('Static Routes:');
            let staticRoutes = server.table()[0].table;
            staticRoutes.forEach((route) => debug(`\t${route.method}\t${route.path}`));
        });
    });
};

// Check to see that the database exists. If not then create it.
const boot = function() {
    fetch(`http://${environment.db.host}:${environment.db.port}/${environment.db.name}`, {
        method: 'PUT',
        headers: {'Authorization': 'Basic ' + base64.encode(`${environment.db.admin}:${environment.db.password}`)},
    }).then(function(response) {
        return response.json();
    }).then(function(json) {
        if (json.error) {
            switch (json.error) {
            case 'file_exists':
                debug(`Database ${environment.db.name} already exists`);
                startServer();
                break;
            default:
                debug(`Database ${environment.db.name} not created`, json.error);
                break;
            }
        } else {
            debug(`New ${environment.db.name} database created. Seeding with petstore API..`);
            fetch(`http://${environment.db.host}:${environment.db.port}/${environment.db.name}/${environment.db.docname}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        spec: API,
                    }),
                })
                .then(function(response) {
                    return response.json();
                }).then(function(json) {
                    if (json.id) {
                        debug(`${json.id} document created at revision ${json.rev}.`);
                        startServer();
                    } else {
                        debug('response', json);
                    }
                });
        }
    }).catch(function(err) {
        debug(err);
    });
};

boot();
