'use strict';
//DEBUGGING
const debug = require('debug');
const error = debug('mocks:error');
const log = debug('mocks:log');
log.log = console.log.bind(console);

const Promise = require("bluebird");

var Assert = require('assert');
var Thing = require('core-util-is');
var builder = require('swaggerize-routes');
var Utils = require('./lib/utils');
// var Mockgen = require('./lib/mockgen.js');
const Swagmock = require('swagmock');
const Chalk = require('chalk');

const Error = debug('mocks:error');
const Log = debug('mocks:log');


const internals = {};

internals.loadApi = function (api) {
    return JSON.parse(api);
};

module.exports.register = function (server, options, next) {
    var routes;
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
        return server.dynaroute.delete(routes)
    }

    const createRoutes = function () {
        var mroutes = [];
        var swaggerRoutes = builder({
            'baseDir': options.baseDir,
            'api': options.api,
            'schema-extensions': true,
            'defaulthandler': defaulthandler
        })
        return Promise.each(swaggerRoutes, route => {
            log(`creating ${route.method} ${route.path}`)
            mroutes.push({
                method: route.method,
                path: basePath + route.path,
                vhost: options.vhost,
                config: {
                    handler: route.handler,
                    cors: options.cors
                }
            });
        }).then(() => {
            routes = mroutes
            server.dynaroute.route(routes)
            log('routes created:', mroutes.length)
            server.plugins.sockets.updateRoutes(routes)
            return Promise.resolve()
        })
        
    }

    const updateRoutes = () => {
        if (routes) {
            log('found routes')
            deleteRoutes();
        } else {
            log('found no routes')  
        }
        createRoutes().then(() => {
            //Add dynamic routes
           log('routes done')
           var dynamicRoutes = server.dynaroute._routes;
           dynamicRoutes.forEach((route) => log(`\t${route.method}\t${route.path}`));
           next();
        })
    }

    server.expose({
        api: options.api
    });

    server.expose('updateRoutes', function () {
        log('update routes called')
        return initRoutes();
    });

    initRoutes();

};

module.exports.register.attributes = {
    pkg: require('./package.json')
};