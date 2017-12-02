'use strict';
require('dotenv').config();
require('hapijs-status-monitor');

const Glue = require('glue');
const Path = require('path');
const debug = require('debug')('server');

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
                    baseDir: Path.resolve('./lib/mocks'),
                    docspath: '/docs',
                },
            }
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
            //server.plugins.mocks.setHost(server.info.host + ':' + server.info.port);
            debug(`${nyan}
                ** ${today.toTimeString()} **
                     Nyan! So much hapi.
                    `);
            debug(`Drunken Master is running on ${server.info.uri}`);
            debug('Static Routes:');
            let staticRoutes = server.table()[0].table;
            staticRoutes.forEach((route) => debug(`\t${route.method}\t${route.path}`));
        });
    });
};

startServer();
