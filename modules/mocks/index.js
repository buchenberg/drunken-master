'use strict';
const debug = require('debug');
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
        var routes, basePath;

        Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
        const dbURL = `http://${options.db.host}:${options.db.port}`;
        log('dbURL: ', dbURL);
        const nano = require('nano')(dbURL);
        const db = nano.use(options.db.name);
        options.basedir = options.basedir || process.cwd();
        options.docspath = Utils.prefix(options.docspath || '/api-docs', '/');

        db.update = function (obj, key, callback) {
            var db = this;
            db.get(key, function (error, existing) {
                if (!error) obj._rev = existing._rev;
                db.insert(obj, key, callback);
            });
        };

        // db.update({ title: 'The new one' }, '1', function (err, res) {
        //     if (err) return console.log('No update!');
        //     console.log('Updated!');
        // });



        db.get(options.db.document, function (err, body) {
            if (body && body.spec) {
                log('Spec found!');
                options.api = body.spec;

            } else {
                error('No spec found! Check your DB.');
                return;
            }

            if (Thing.isString(options.api)) {
                options.api = loadApi(options.api);
            }

            Assert.ok(Thing.isObject(options.api), 'Api definition must resolve to an object.');

            options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
            basePath = Utils.unsuffix(options.api.basePath, '/');

            const defaulthandler = function (request, reply) {
                let status = 200;
                let path = request.route.path.replace(options.api.basePath, '');
                let mockOptions = {
                    path: path,
                    operation: request.method,
                    response: status
                };
                log('mock options', mockOptions);

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

            //API docs route
            server.route({
                method: 'GET',
                path: options.docspath,
                config: {
                    handler: function (request, reply) {
                        db.get(options.db.document, function (err, res) {
                            if (err) {
                                error('No update! ', err);
                                reply({error: err});
                            }
                            log('Got it!');
                            reply(res.spec);
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            // OAS Routes
            server.route({
                method: 'PUT',
                path: '/oas',
                config: {
                    handler: function (request, reply) {
                        db.update({
                            spec: request.payload
                        }, 'swagger', function (err, res) {
                            if (err) {
                                error('No update! ', err);
                                reply({error: err});
                            }
                            log('Updated!', res);
                            reply(res);
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });
            server.route({
                method: 'GET',
                path: '/oas',
                config: {
                    handler: function (request, reply) {
                        db.get(options.db.document, function (err, res) {
                            if (err) {
                                error('No update! ', err);
                                reply({error: err});
                            }
                            log('Got it!');
                            reply(res.spec);
                        });
                    },
                    cors: options.cors
                },
                vhost: options.vhost
            });

            //Add all known routes
            routes.forEach(function (route) {
                //Define the route
                server.route({
                    method: route.method,
                    path: basePath + route.path,
                    handler: route.handler,
                    vhost: options.vhost
                });
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

/**
 * Loads the api from a path, with support for yaml..
 * @param apiPath
 * @returns {Object}
 */
function loadApi(apiPath) {
    if (apiPath.indexOf('.yaml') === apiPath.length - 5 || apiPath.indexOf('.yml') === apiPath.length - 4) {
        return Yaml.load(Fs.readFileSync(apiPath));
    }
    return require(apiPath);
}


module.exports.register.attributes = {
    pkg: require('./package.json')
};