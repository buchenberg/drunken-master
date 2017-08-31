'use strict';
const debug = require('debug');
var Assert = require('assert');
var Thing = require('core-util-is');
var builder = require('swaggerize-routes');
var Utils = require('./lib/utils');
// var Mockgen = require('./lib/mockgen.js');
const Swagmock = require('swagmock');
const Chalk = require('chalk');

const Error = debug('mocks:error');
const Log = debug('mocks:log');






module.exports = {
    register: function (server, options, next) {
        var routes, basePath;


        Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
        const dbURL = `http://${options.db.host}:${options.db.port}`;
        Log('dbURL: ', Chalk.blue(dbURL));
        const nano = require('nano')(dbURL);
        const db = nano.use(options.db.name);
        options.basedir = options.basedir || process.cwd();
        options.docspath = options.docspath || '/oas';
        options.cors = {
            origin: ['*']
        };

        const defaulthandler = function (request, reply) {
            // let status = 200;
            let path = request.route.path.replace(options.api.basePath, '');
            // log(options.api.paths[path]);
            let mockOptions = {
                path: path,
                operation: request.method,
                response: '200'
            };
            // log(mockOptions);
            let Mockgen = Swagmock(options.api, mockOptions);
            Mockgen.responses(mockOptions)
            .then( mock => {
                reply(mock.responses[0]);
            }).catch(error => {
                reply({ 'drunken-master-error': error });
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
                Error(Chalk.red('No spec found! Check your DB.'));
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

                //Build routes
                routes = builder({
                    'baseDir': options.baseDir,
                    'api': options.api,
                    'schema-extensions': true,
                    'defaulthandler': defaulthandler
                });

                //Add dynamic routes
                routes.forEach(function (route) {
                    // log(`adding ${route.name}`);
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
                // log(routes);
            } else {
                options.api.basePath = '/';
            }

            // Static Routes

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
                            body.spec.basePath = Utils.prefix(body.spec.basePath || '/', '/');
                            if (options.api.hasOwnProperty('basePath')) {
                                options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
                            }
                            basePath = Utils.unsuffix(options.api.basePath, '/');
                            if (routes) {
                                routes.forEach(function (route, index) {
                                    //Delete the route
                                    Log(`deleting ${Chalk.red(route.name)}`);
                                    server.malkoha.delete({
                                        method: route.method,
                                        path: basePath + route.path,
                                        vhost: options.vhost
                                    });
                                    routes.splice(index, 1);
                                });
                            }
                            routes = builder({
                                'baseDir': options.baseDir,
                                'api': options.api,
                                'schema-extensions': true,
                                'defaulthandler': defaulthandler
                            });
                            //Add all known routes
                            const routesReport = [];
                           
                            routes.forEach(function (route) {
                                routesReport.push(route.path);
                                Log(`adding ${Chalk.green(route.name)}`);
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
                            reply({ 'routes': routesReport }).code(200);
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