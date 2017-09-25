'use strict';
//DEBUGGING
const debug = require('debug');
const error = debug('mocks:error');
const log = debug('mocks:log');
log.log = console.log.bind(console);

var Assert = require('assert');
var Thing = require('core-util-is');
var builder = require('swaggerize-routes');
var Utils = require('./lib/utils');
// var Mockgen = require('./lib/mockgen.js');
const Swagmock = require('swagmock');
const Chalk = require('chalk');

const Error = debug('mocks:error');
const Log = debug('mocks:log');

var routes = null;

const internals = {};

internals.loadApi = function (api) {
    return JSON.parse(api);
};

module.exports.register = function (server, options, next) {
    var basePath;
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
    
    // Default mock handler
    const defaulthandler = function (request, reply) {
        let path = request.route.path.replace(options.api.basePath, '');
        let mockOptions = {
            path: path,
            operation: request.method,
            response: '200'
        };
        let Mockgen = Swagmock(options.api, mockOptions);
        Mockgen.responses(mockOptions)
            .then(mock => {
                reply(mock.responses[0]);
            }).catch(error => {
                reply({ 'drunken-master-error': error })
                    .code(500);
            });
    };
    // Custom "update" method creates a new version in CouchDB
    db.update = function (obj, key, callback) {
        var db = this;
        db.get(key, function (error, existing) {
            if (!error) obj._rev = existing._rev;
            db.insert(obj, key, callback);
        });
    };

    const initRoutes = function () {
        // Initialize dynamic routes
        db.get(options.db.document, function (err, body) {
            if (body && body.spec) {
                options.api = body.spec;
            } else {
                Error(Chalk.red('No spec found! Check your DB.'));
                options.api = {};
            }

            if (Thing.isString(options.api)) {
                options.api = internals.loadApi(options.api);
            }

            Assert.ok(Thing.isObject(options.api), 'Api definition must resolve to an object.');

            if (options.api.hasOwnProperty('basePath')) {
                options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
                basePath = Utils.unsuffix(options.api.basePath, '/');
                updateRoutes();
                //Expose plugin api
                server.expose({
                    api: options.api
                });
            } else {
                options.api.basePath = '/';
            };
            
        });

    }

    const deleteRoutes = function () {
        routes.forEach(function (route) {
            console.log(`deleting ${route.method} ${route.path}`)
            return server.malkoha.delete({
                method: route.method,
                path: basePath + route.path,
            });
        });
        routes = null;
    }

    const createRoutes = function () {
        routes.forEach(function (route) {
            console.log(`creating ${route.method} ${route.path}`)
            return server.malkoha.route({
                method: route.method,
                path: basePath + route.path,
                vhost: options.vhost,
                config: {
                    handler: route.handler,
                    cors: options.cors
                }
            });
        });
        server.plugins.sockets.updateRoutes(server.malkoha._routes)
        server.malkoha._routes
        next();
    }

    const updateRoutes = () => {
        if (routes) {
            deleteRoutes(routes);
        }
        // routes = rts
        routes = builder({
            'baseDir': options.baseDir,
            'api': options.api,
            'schema-extensions': true,
            'defaulthandler': defaulthandler
        });
        //Add dynamic routes
        createRoutes();
    }

    server.expose('updateRoutes', function () { return updateRoutes(); });

    initRoutes();

    next();
};

module.exports.register.attributes = {
    pkg: require('./package.json')
};