'use strict';
// DEBUGGING
const debug = require('debug');
const error = debug('routes:error');
const log = debug('routes:log');
log.log = console.log.bind(console);

const Yaml = require('js-yaml');
const Nano = require('nano');


module.exports = {
    register: function(server, options, next) {
        // Set up couchdb client (nano)
        const dbURL = `http://${options.db.host}:${options.db.port}`;
        log('dbURL: ', dbURL);
        const nano = Nano(dbURL);
        const db = nano.use(options.db.name);

        options.basedir = options.basedir || process.cwd();
        options.docspath = options.docspath || '/oas';
        options.cors = {
            origin: ['*'],
        };

        // Custom update function
        db.update = function(obj, key, callback) {
            let db = this;
            db.get(key, function(error, existing) {
                if (!error) obj._rev = existing._rev;
                db.insert(obj, key, callback);
            });
        };

        // HEALTH ROUTE
        server.route({
            method: 'GET',
            path: '/dapi/health',
            config: {
                handler: function(request, reply) {
                    reply(
                        {'status': 'OK'}
                    ).code(200);
                },
                cors: options.cors,
            },
        });

        // Status ROUTE
        server.route({
            method: 'GET',
            path: '/dapi/status',
            config: {
                json: {
                    space: 2,
                },
                handler: function(request, reply) {
                    db.get(options.db.document, function(error) {
                        if (error) {
                            reply({
                                'oas': false,
                                error,
                            }).code(404);
                        } else {
                            reply(
                                {
                                    'oas': true,
                                    'msg': 'Aw yeah!',
                                }
                            ).code(200);
                        }
                    });
                },
                cors: options.cors,
            },
            vhost: options.vhost,
        });

        // OAS Routes
        // SAVE OAS
        server.route({
            method: 'PUT',
            path: options.docspath,
            config: {
                handler: function(request, reply) {
                    db.update({
                        spec: request.payload,
                    }, options.db.document, function(err, res) {
                        if (err) {
                            reply({error: err});
                        } else {
                            reply(res);
                        }
                    });
                },
                cors: options.cors,
            },
            vhost: options.vhost,
        });
        // GET OAS METADATA
        server.route({
            method: 'GET',
            path: options.docspath,

            config: {
                json: {
                    space: 2,
                },
                handler: function(request, reply) {
                    db.get(options.db.document, function(error, res) {
                        if (error) {
                            reply({
                                'oas': false,
                                'error': error.message,
                            }).code(404);
                        } else {
                            reply(res).code(200);
                        }
                    });
                },
                cors: options.cors,
            },
            vhost: options.vhost,
        });
        // GET OAS AS JSON
        server.route({
            method: 'GET',
            path: options.docspath + '/json',

            config: {
                json: {
                    space: 2,
                },
                handler: function(request, reply) {
                    db.get(options.db.document, function(error, res) {
                        if (error) {
                            reply({
                                'oas': false,
                                'error': error.message,
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
                cors: options.cors,
            },
            vhost: options.vhost,
        });
        // GET OAS AS YAML
        server.route({
            method: 'GET',
            path: options.docspath + '/yaml',

            config: {
                handler: function(request, reply) {
                    db.get(options.db.document, function(error, res) {
                        if (error) {
                            reply({
                                'oas': false,
                                'error': error.message,
                            }).code(404);
                        } else {
                            reply(Yaml.safeDump(res.spec))
                                .code(200)
                                .type('application/x-yaml');
                        }
                    });
                },
                cors: options.cors,
            },
            vhost: options.vhost,
        });
        next();
    },
};


module.exports.register.attributes = {
    pkg: require('./package.json'),
};
