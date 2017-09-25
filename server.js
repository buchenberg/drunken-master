'use strict';
require('dotenv').config();

const Glue = require('glue');
const Path = require('path');
const debug = require('debug');
const error = debug('server:error');
const log = debug('server:log');
log.log = console.log.bind(console);
const Chalk = require('chalk');
const { Malkoha } = require('malkoha');
const Nano = require('nano');
const Petstore = require('./petstore.json');

// Load environmental variables or suitable defaults
const environment = {
    tls: process.env.TLS || false,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5984,
        name: process.env.DB_NAME || 'drunken-master',
        docname: process.env.DB_DOC_NAME || 'spec',
        admin: process.env.DB_ADMIN_NAME,
        password: process.env.DB_ADMIN_PASSWORD
    },
    api: {
        host: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 9999
    },
    proxy: {
        upstream_host: process.env.PROXY_UPSTREAM_HOST,
        upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL,
        header_host: process.env.PROXY_HEADER_HOST
    }

};

const dbURL = `http://${environment.db.host}:${environment.db.port}`;
log('dbURL: ', dbURL);
const nano = Nano(dbURL);
const db = nano.use(environment.db.name);

// Check to see that the database exists. If not then create it.

// Get the session token from the cookie string
const parseSession = function (cookieString) {
    return cookieString.replace(/(?:^AuthSession=)(.*)(;\sV.*)/i, '$1');
};

const bootstrapDB = function () {
    nano.db.get(environment.db.name, function (err) {
        // No database yet
        if (err) {
            error(`There was an error finding the ${environment.db.name} database:\n${err}`);
            log(`Attempting to create ${environment.db.name} database.`);
            log('Getting admin session.');
            var token = '';
            // Get an admin session to create the database
            nano.auth(environment.db.admin, environment.db.password, function (err, body, headers) {
                if (err) {
                    return error(err);
                }
                if (headers && headers['set-cookie']) {
                    token = parseSession(headers['set-cookie'][0]);
                }
                // Use the token to perform the db creation
                Nano(
                    {
                        url: dbURL,
                        cookie: 'AuthSession=' + token
                    }
                ).db.create(environment.db.name, function (err) {
                    if (err) {
                        error(`There was an error creating the ${environment.db.name} database:\n${err}`);
                    } else {
                        log(`database ${environment.db.name} created.`);
                        var database = nano.use(environment.db.name);
                        database.insert({ spec: Petstore }, 'oas', function(err, body) {
                            if (err) {
                                error(err)
                            }
                            else
                            log(body);
                        });
                    }
                });
            });

        }
        // Database already exists
        else {
            log(`database ${environment.db.name} exists.`);
        }
    });
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
                    origin: ['*']
                },
                files: {
                    relativeTo: Path.join(__dirname, 'modules/ui/build')
                }
            }

        }
    ],
    registrations: [
        {
            plugin: Malkoha
        },
        {
            plugin: 'inert'
        },
        {
            plugin: 'vision'
        },
        // {
        //     plugin: 'blipp'
        // },
        {
            plugin: 'h2o2'
        },
        {
            plugin: {
                register: './modules/sockets'
            }
        },
        {
            plugin: {
                register: './modules/mocks',
                options: {
                    db: {
                        host: environment.db.host,
                        port: environment.db.port,
                        name: environment.db.name,
                        document: environment.db.docname,
                        admin: environment.db.admin,
                        password: environment.db.password
                    },
                    baseDir: Path.resolve('./modules/mocks'),
                    docspath: '/api/oas'
                }
            }
        },
        {
            plugin: {
                register: './modules/routes',
                options: {
                    db: {
                        host: environment.db.host,
                        port: environment.db.port,
                        name: environment.db.name,
                        document: environment.db.docname,
                        admin: environment.db.admin,
                        password: environment.db.password
                    },
                    baseDir: Path.resolve('./modules/mocks'),
                    docspath: '/api/oas'
                }
            }
        },
        {
            plugin: {
                register: './modules/ui',
                options: {
                    cors: {
                        origin: ['*']
                    }
                }
            }
        }
    ]
};

const options = {
    relativeTo: __dirname
};

// Bootstrap the database
bootstrapDB();

Glue.compose(manifest, options, (err, server) => {
    if (err) {
        throw err;
    }
    server.start(() => {
       // server.plugins.mocks.setHost(server.info.host + ':' + server.info.port);
        log(`Drunken Master is running on ${Chalk.cyan(Chalk.underline(server.info.uri))}`);
        log('Static Routes:');
        var staticRoutes = server.table()[0].table;
        staticRoutes.forEach((route) => log(`\t${route.method}\t${route.path}`));
        log('Dynamic Routes:');
        var dynamicRoutes = server.malkoha._routes;
        dynamicRoutes.forEach((route) => log(`\t${route.method}\t${route.path}`));
    });
});