'use strict';
//DEBUGGING
const debug = require('debug');
const error = debug('monitor:error');
const log = debug('monitor:log');
log.log = console.log.bind(console);

const Yaml = require('js-yaml');
const Nano = require('nano');
const { Malkoha } = require('malkoha');

module.exports = {
    register: function (server, options, next) {
        // Set up couchdb client (nano)
        const dbURL = `http://${options.db.host}:${options.db.port}`;
        log('dbURL: ', dbURL);
        const nano = Nano(dbURL);
        const db = nano.use(options.db.name);
        //const serverInfo = server.info;

        options.basedir = options.basedir || process.cwd();
        options.docspath = options.docspath || '/api/oas';
        options.cors = {
            origin: ['*']
        };


        // Custom update function
        db.update = function (obj, key, callback) {
            var db = this;
            db.get(key, function (error, existing) {
                if (!error) obj._rev = existing._rev;
                db.insert(obj, key, callback);
            });
        };

        // HEALTH ROUTE
        server.route({
            method: 'GET',
            path: '/api/health',
            config: {
                handler: function (request, reply) {
                    reply(
                        { 'status': 'OK' }
                    ).code(200);
                },
                cors: options.cors
            }
        });

        // Status ROUTE
        server.route({
            method: 'GET',
            path: '/api/status',
            config: {
                json: {
                    space: 2
                },
                handler: function (request, reply) {
                    let staticRoutes = [];
                    let dynamicRoutes = [];

                    server.table()[0].table.map(
                        function (route) {
                            log(server.info)
                            staticRoutes.push({
                                route: route.info,
                                method: route.method,
                                path: route.path
                            });
                        }
                    );

                    server.malkoha._routes.map(
                        function (route) {
                            dynamicRoutes.push({
                                method: route.method,
                                path: route.path
                            });
                        }
                    );

                    //let server = serverInfo;

                    let routes = {
                            static: staticRoutes,
                            dynamic: dynamicRoutes
                    };

                    db.get(options.db.document, function (err, res) {
                        if (err) {
                            reply({
                                oas: false,
                                msg: err,
                                //server: serverInfo,
                                routes

                            }).code(404);
                        } else {
                            reply(
                                {
                                    oas: true,
                                    revision: res._rev,
                                    msg: res.msg,
                                    //server: serverInfo,
                                    routes
                                }
                            ).code(200);
                        }

                    });
                },
                cors: options.cors
            },
            vhost: options.vhost
        });

        // OAS Routes
        // SAVE OAS
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
                        } else {
                            reply(res);
                        }

                    });
                },
                cors: options.cors
            },
            vhost: options.vhost
        });
        // GET OAS METADATA
        server.route({
            method: 'GET',
            path: options.docspath + '/revision',

            config: {
                json: {
                    space: 2
                },
                handler: function (request, reply) {
                    db.get(options.db.document, function (error, res) {
                        if (error) {
                            reply({
                                'oas': false,
                                'error': error.message
                            }).code(404);
                        } else {
                            reply({ revision: res._rev })
                                .code(200)
                                .type('application/json');
                        }

                    });
                },
                cors: options.cors
            },
            vhost: options.vhost
        });
        // GET OAS AS JSON
        server.route({
            method: 'GET',
            path: options.docspath + '/json',

            config: {
                json: {
                    space: 2
                },
                handler: function (request, reply) {
                    db.get(options.db.document, function (error, res) {
                        if (error) {
                            reply({
                                'oas': false,
                                'error': error.message
                            })
                                .code(404)
                                .type('application/json');
                        } else {
                            reply(res.spec)
                                .code(200)
                                .type('application/json');
                        }
                    });
                },
                cors: options.cors
            },
            vhost: options.vhost
        });
        // GET OAS AS YAML
        server.route({
            method: 'GET',
            path: options.docspath + '/yaml',

            config: {
                handler: function (request, reply) {
                    db.get(options.db.document, function (error, res) {
                        if (error) {
                            reply({
                                'oas': false,
                                'error': error.message
                            }).code(404);
                        } else {
                            reply(Yaml.safeDump(res.spec))
                                .code(200)
                                .type('application/x-yaml');
                        }

                    });
                },
                cors: options.cors
            },
            vhost: options.vhost
        });
        next();


    }
};


module.exports.register.attributes = {
    pkg: require('./package.json')
};