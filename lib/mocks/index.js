'use strict';
const debug = require('debug');
const Builder = require('swaggerize-routes');
const Utils = require('./lib/utils');
const Xmock = require('x-mock');
const Chalk = require('chalk');
const Oas = require('./oas');
const Mixins = require('./lib/mixins');

const Error = debug('mocks:error');
const Log = debug('mocks:log');

module.exports.register = function (server, options, next) {
    options.basedir = options.basedir || process.cwd();
    options.docspath = options.docspath || '/oas';
    options.cors = {
        origin: ['*'],
    };


    Oas.specs.forEach(function (spec) {
        const oas = spec.oas;
        server.route({
            method: 'GET',
            path: spec.docpath,
            config: {
                json: {
                    space: 2,
                },
                handler: function (request, reply) {
                    reply(oas);
                },
                cors: options.cors,
            },
            vhost: options.vhost,
        });

        if (oas.hasOwnProperty('basePath')) {
            oas.basePath = Utils.prefix(oas.basePath || '/', '/');
            const basePath = Utils.unsuffix(oas.basePath, '/');
            // Build routes
            const routes = Builder({
                'baseDir': options.baseDir,
                'api': oas,
                'schema-extensions': true,
                'defaulthandler': function (request, reply) {
                    let path = request.route.path.replace(oas.basePath, '');
                    let mockOptions = {
                        path: path,
                        operation: request.method,
                        response: '200',
                    };
                    let Mock = Xmock(oas, { 'mixins': Mixins });
                    Mock.response(mockOptions)
                        .then((mock) => {
                            if (mock) {
                                reply(mock);
                            } else {
                                reply({ 'drunken-master-error': 'no mock response found.' })
                                .code(500);
                            }
                        }).catch((error) => {
                            reply({ 'drunken-master-error': error })
                            .code(500);
                        });
                },
            });
            // Add routes
            routes.forEach(function (route) {
                // Define the dynamic route
                server.route({
                    method: route.method,
                    path: basePath + route.path,
                    vhost: options.vhost,
                    config: {
                        handler: route.handler,
                        cors: options.cors,
                        // Needed for legacy cookies that violate RFC 6265
                        state: {
                            parse: false,
                            failAction: 'ignore',
                        },
                    },
                });
            });
        } else {
            oas.basePath = '/';
        }
    });

    // GET OAS METADATA
    server.route({
        method: 'GET',
        path: '/oas',
        config: {
            json: {
                space: 2,
            },
            handler: function (request, reply) {
                let json = [];
                Oas.specs.forEach(function (spec) {
                    json.push({
                        "title": spec.title,
                        "path": spec.docpath
                    })
                })
                reply(json);
            },
            cors: options.cors,
        },
        vhost: options.vhost,
    });

    // Expose plugin api
    server.expose({
        specs: Oas.specs
    });

    // Done
    next();

};

module.exports.register.attributes = {
    pkg: require('./package.json'),
};
