'use strict';
const debug = require('debug');
const Path = require('path');
var Assert = require('assert');
var Thing = require('core-util-is');
var builder = require('swaggerize-routes');
var Utils = require('./lib/utils');
var Yaml = require('js-yaml');
var Fs = require('fs');
var Mockgen = require('./lib/mockgen.js');

const error = debug('index:error');
const log = debug('index:log');
log.log = console.log.bind(console);





module.exports = {
    register: function (server, options, next) {
        var routes, newRoutes, basePath, defaulthandler;


        Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
        const dbURL = `http://${options.db.host}:${options.db.port}`;
        log('dbURL: ', dbURL);
        const nano = require('nano')(dbURL);
        const db = nano.use(options.db.name);
        options.basedir = options.basedir || process.cwd();
        options.docspath = options.docspath || '/oas';
        options.cors = {
            origin: ['*']
        };

        db.update = function (obj, key, callback) {
            var db = this;
            db.get(key, function (error, existing) {
                if (!error) obj._rev = existing._rev;
                db.insert(obj, key, callback);
            });
        };

        db.get(options.db.document, function (err, body) {
            log('running dbget');
            if (body && body.spec) {
                log('Spec found!');
                options.api = body.spec;

            } else {
                error('No spec found! Check your DB.');
                options.api = {};
                //return;
            }

            if (Thing.isString(options.api)) {
                options.api = loadApi(options.api);
            }

            Assert.ok(Thing.isObject(options.api), 'Api definition must resolve to an object.');
            if (options.api.hasOwnProperty('basePath')) {
                options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
                basePath = Utils.unsuffix(options.api.basePath, '/');

                defaulthandler = function (request, reply) {
                    let status = 200;
                    let path = request.route.path.replace(options.api.basePath, '');
                    let mockOptions = {
                        path: path,
                        operation: request.method,
                        response: status
                    };


                    let responseMock = Mockgen(options.api).responses(mockOptions);
                    responseMock.then(mock => {
                        reply(mock);
                    }).catch(error => {
                        reply({ 'drunken-master-error': error });
                    });
                };

                //Build routes
                routes = builder({
                    'baseDir': options.baseDir,
                    'api': options.api,
                    'schema-extensions': true,
                    'defaulthandler': defaulthandler
                });

                //Add all known routes
                routes.forEach(function (route) {
                    //Define the route
                    server.malkoha.route({
                        method: route.method,
                        path: basePath + route.path,
                        vhost: options.vhost,
                        config: {
                            handler: route.handler,
                            cors: options.cors
                        }
                    });
                });
            } else {
                options.api.basePath = '/';
            }

            // UI route
            server.route({
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: 'modules/ui/build'
                    }
                }
            });

            // server route
            server.route({
                method: 'PUT',
                path: '/server',
                config: {
                    handler: function (request, reply) {
                        
                        debug('rerouting..');
                        db.get(options.db.document, function (err, body) {
                            //options.api = body.spec;
                            // Assert.ok(Thing.isObject(options.api), 'Api definition must resolve to an object.');
                            body.spec.basePath = Utils.prefix(body.spec.basePath || '/', '/');
                            basePath = Utils.unsuffix(body.spec.basePath, '/');
                            const myHandler = function (request, reply) {
                                let status = 200;
                                let path = request.route.path.replace(body.spec.basePath, '');
                                let mockOptions = {
                                    path: path,
                                    operation: request.method,
                                    response: status
                                };
            
            
                                let responseMock = Mockgen(body.spec).responses(mockOptions);
                                responseMock.then(mock => {
                                    reply(mock);
                                }).catch(error => {
                                    reply({ 'drunken-master-error': error });
                                });
                            };
                            newRoutes = builder({
                                'baseDir': options.baseDir,
                                'api': body.spec,
                                'schema-extensions': true,
                                'defaulthandler': myHandler
                            });
                            //Add all known routes
                            const routesReport = [];
                            routes.forEach(function (route) {
                                //Delete the route
                                log(`deleting ${route.path}`);
                                server.malkoha.delete({
                                    method: route.method,
                                    path: basePath + route.path,
                                    vhost: options.vhost
                                });
                            });
                            newRoutes.forEach(function (newRoute) {
                                routesReport.push(newRoute.path);
                                log(`adding ${newRoute.path}`);
                                //Define the route
                                server.malkoha.route({
                                    method: newRoute.method,
                                    path: basePath + newRoute.path,
                                    vhost: options.vhost,
                                    config: {
                                        handler: myHandler,
                                        cors: true
                                    }
                                });
                            });
                            reply({ 'routes': routesReport }).code(200);
                        });

                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            // OAS Routes
            server.route({
                method: 'PUT',
                path: options.docspath,
                config: {
                    handler: function (request, reply) {
                        db.update({
                            spec: request.payload
                        }, options.db.document, function (err, res) {
                            if (err) {
                                reply({ error: err });
                            }
                            reply(res);
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });
            server.route({
                method: 'GET',
                path: options.docspath,

                config: {
                    json: {
                        space: 2
                    },
                    handler: function (request, reply) {
                        db.get(options.db.document, function (err, res) {
                            if (err) {
                                reply({ error: err });
                            }
                            log('Got it!');
                            reply(res);
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });
            server.route({
                method: 'GET',
                path: options.docspath + '/json',

                config: {
                    json: {
                        space: 2
                    },
                    handler: function (request, reply) {
                        db.get(options.db.document, function (err, res) {
                            if (err) {
                                reply({ error: err });
                            }
                            log('Got it!');
                            reply(res.spec);
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            server.route({
                method: 'GET',
                path: options.docspath + '/yaml',

                config: {
                    handler: function (request, reply) {
                        db.get(options.db.document, function (err, res) {
                            if (err) {
                                reply({ error: err });
                            }
                            log('Got it!');
                            reply(Yaml.safeDump(res.spec));
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            //Expose plugin api
            server.expose({
                api: options.api,
                setHost: function setHost(host) {
                    this.api.host = options.api.host = host;
                }
            });

            //Done
            next();

        });
    }
};

function loadApi(api) {
    return JSON.parse(api);
}


module.exports.register.attributes = {
    pkg: require('./package.json')
};