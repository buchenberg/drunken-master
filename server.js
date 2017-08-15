'use strict';
require('dotenv').config();
const Glue = require('glue');
const Path = require('path');
const debug = require('debug')('server');
const Chalk = require('chalk');

let tls = false;


const environment = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5984,
        name: process.env.DB_NAME || 'oas'
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
            tls: tls,
            routes: {
                cors: {
                    origin: ['*']
                }
            }

        }
    ],
    registrations: [
        {
            plugin: 'inert'
        },
        {
            plugin: 'vision'
        },
        {
            plugin: 'blipp'
        },
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
                        document: 'spec'
                    },
                    baseDir: Path.resolve('./modules/mocks'),
                    docspath: '/swagger'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-swaggered-ui',
                options: {
                    swaggerEndpoint: '/oas',
                    path: '/swagger-ui',
                    title: 'Drunken Master',
                    swaggerOptions: {}
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
        debug(`Swagger UI is running on ${Chalk.cyan(Chalk.underline(server.info.uri + '/swagger-ui'))}`);
    });
});