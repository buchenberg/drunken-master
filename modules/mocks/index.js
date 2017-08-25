'use strict';
const debug = require('debug');
var Assert = require('assert');
var Thing = require('core-util-is');
var builder = require('swaggerize-routes');
var Utils = require('./lib/utils');
var Yaml = require('js-yaml');
// var Mockgen = require('./lib/mockgen.js');
const Swagmock = require('swagmock');

const error = debug('index:error');
const log = debug('index:log');
log.log = console.log.bind(console);





module.exports = {
    register: function (server, options, next) {
        var routes, basePath;


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

        const defaulthandler = function (request, reply) {
            let path = request.route.path.replace(options.api.basePath, '');
            log(options.api.paths[path]);
            let mockOptions = {
                path: path,
                operation: request.method,
                response: '200'
            };
            log(mockOptions);
            let Mockgen = Swagmock(options.api, mockOptions);
            Mockgen.responses(mockOptions)
                .then(mock => {
                    reply(mock.responses[0]);
                }).catch(error => {
                    reply({ 'drunken-master-error': error });
                });
        };

        const buildRoutes = function () {
            //Set basePath
            if (options.api.hasOwnProperty('basePath')) {
                options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
                basePath = Utils.unsuffix(options.api.basePath, '/');
                //log(routes);
            } else {
                options.api.basePath = '/';
            }
            //Build dyanamic routes metadata
            routes = builder({
                'baseDir': options.baseDir,
                'api': options.api,
                'schema-extensions': true,
                'defaulthandler': defaulthandler
            });
            //Add dynamic routes
            routes.forEach(function (route) {
                log(`adding ${route.name}`);
                // Define the dynamic route
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
        };

        db.update = function (obj, key, callback) {
            var db = this;
            db.get(key, function (error, existing) {
                if (!error) obj._rev = existing._rev;
                db.insert(obj, key, callback);
            });
        };

        db.get(options.db.document, function (err, body) {
            if (body && body.spec) {
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

            buildRoutes();

            // Static Routes

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
            // server route (reroute)
            server.route({
                method: 'PUT',
                path: '/server',
                config: {
                    handler: function (request, reply) {

                        debug('rerouting..');
                        db.get(options.db.document, function (err, body) {
                            options.api = body.spec;
                            Assert.ok(Thing.isObject(options.api), 'Api definition must resolve to an object.');

                            buildRoutes();
                            body.spec.basePath = Utils.prefix(body.spec.basePath || '/', '/');
                            if (options.api.hasOwnProperty('basePath')) {
                                options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
                            }
                            basePath = Utils.unsuffix(options.api.basePath, '/');
                           
                            routes = builder({
                                'baseDir': options.baseDir,
                                'api': options.api,
                                'schema-extensions': true,
                                'defaulthandler': defaulthandler
                            });
                            //Add all known routes
                            //const routesReport = [];

                            routes.forEach(function (route) {
                                // routesReport.push(route.path);
                                log(`adding ${route.name}`);
                                //Define the route
                                server.malkoha.route({
                                    method: route.method,
                                    path: basePath + route.path,
                                    vhost: options.vhost,
                                    config: {
                                        handler: defaulthandler,
                                        cors: true
                                    }
                                });
                            });
                            log(routes);
                            reply({ 'routes': routes }).code(200);
                        });

                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            // OAS Routes
            // PUT OAS JSON
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
            // GET OAS
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
            // GET OAS JSON
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
                            reply(res.spec)
                                .code(200)
                                .type('application/json');
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });
            // GET OAS YAML
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
                            reply(Yaml.safeDump(res.spec))
                                .code(200)
                                .type('application/x-yaml');
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            // GET ROUTES
            server.route({
                method: 'GET',
                path: '/routes',

                config: {
                    json: {
                        space: 2
                    },
                    handler: function (request, reply) {
                        reply(routes)
                            .code(200)
                            .type('application/json');
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