'use strict';
const debug = require('debug');
let Assert = require('assert');
let Thing = require('core-util-is');
let builder = require('swaggerize-routes');
let Utils = require('./lib/utils');
const Xmock = require('x-mock');
const Chalk = require('chalk');
const Oas = require('./oas');

const Error = debug('mocks:error');
const Log = debug('mocks:log');

module.exports.register = function (server, options, next) {
    let routes, basePath;
    options.basedir = options.basedir || process.cwd();
    options.docspath = options.docspath || '/oas';
    options.cors = {
        origin: ['*'],
    };
    // Default mock handler
    const defaulthandler = function (request, reply) {
        let path = request.route.path.replace(spec.basePath, '');
        let mockOptions = {
            path: path,
            operation: request.method,
            response: '200',
        };
        let Mock = Xmock(spec, mockOptions);
        Mock.responses(mockOptions)
            .then((mock) => {
                if (mock.responses) {
                    reply(mock.responses);
                } else {
                    reply({ 'drunken-master-error': 'no mock response found.' });
                }
            }).catch((error) => {
                reply({ 'drunken-master-error': error })
                    .code(500);
            });
    };

    Oas.specs.forEach(function (spec) {
        let docpath = spec.docpath;
        let oas = spec.oas;
        server.route({
            method: 'GET',
            path: docpath,
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
            basePath = Utils.unsuffix(oas.basePath, '/');
            // Build routes
            routes = builder({
                'baseDir': options.baseDir,
                'api': oas,
                'schema-extensions': true,
                'defaulthandler': defaulthandler,
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
                        cors: true,
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
                let jsonResp = [];
                Oas.specs.forEach(function (spec) {
                    jsonResp.push({
                        "title": spec.title,
                        "path": spec.docpath
                    })
                })
                reply(jsonResp);
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
