'use strict';
require('dotenv').config();
const Glue = require('glue');
const Path = require('path');
const debug = require('debug')('server');
const Chalk = require('chalk');
const { Malkoha } = require('malkoha');

// Load environmental variables or suitable defaults
const environment = {
    tls: process.env.TLS || false,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5984,
        name: process.env.DB_NAME || 'oas',
        docname: process.env.DB_DOC_NAME || 'spec'
    },
    api: {
        host: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 9990
    },
    ui: {
        host: process.env.UI_HOST || 'localhost',
        port: process.env.UI_PORT || 9990
    },
    ws: {
        port: process.env.WS_PORT || 9991
    },
    proxy: {
        upstream_host: process.env.PROXY_UPSTREAM_HOST,
        upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL,
        header_host: process.env.PROXY_HEADER_HOST
    }

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
                register: './modules/mocks',
                options: {
                    db: {
                        host: environment.db.host,
                        port: environment.db.port,
                        name: environment.db.name,
                        document: environment.db.docname
                    },
                    baseDir: Path.resolve('./modules/mocks'),
                    docspath: '/oas'
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
                        document: environment.db.docname
                    },
                    baseDir: Path.resolve('./modules/mocks'),
                    docspath: '/oas'
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

Glue.compose(manifest, options, (err, server) => {
    if (err) {
        throw err;
    }
    server.start(() => {
        server.plugins.mocks.setHost(server.info.host + ':' + server.info.port);
        debug(`Drunken Master is running on ${Chalk.cyan(Chalk.underline(server.info.uri))}`);
        debug('Static Routes:');
        var staticRoutes = server.table()[0].table;
        staticRoutes.forEach((route) => debug(`\t${route.method}\t${route.path}`));
        debug('Dynamic Routes:');
        var dynamicRoutes = server.malkoha._routes;
        dynamicRoutes.forEach((route) => debug(`\t${route.method}\t${route.path}`));
    });
});