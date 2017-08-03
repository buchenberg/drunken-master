'use strict';
require('dotenv').config();
const Glue = require('glue');
const Path = require('path');
const debug = require('debug')('server');
const fs = require('fs');
const chalk = require('chalk');

let tls = false;


const environment = {
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
                register: './modules/toast',
                options: {
                    api: Path.resolve('./modules/toast/config/swagger.json'),
                    baseDir: Path.resolve('./modules/toast'),
                    docspath: '/swagger'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-swaggered-ui',
                options: {
                    swaggerEndpoint: '/v1/swagger',
                    path: '/swagger-ui',
                    title: 'Powdered Toast',
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
        server.plugins.toast.setHost(server.info.host + ':' + server.info.port);
        debug(`Swagger UI is running on ${chalk.cyan(chalk.underline(server.info.uri + '/swagger-ui'))}`);
    });
});