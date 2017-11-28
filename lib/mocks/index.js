'use strict';
const debug = require('debug');
let Assert = require('assert');
let Thing = require('core-util-is');
let builder = require('swaggerize-routes');
let Utils = require('./lib/utils');
const Xmock = require('x-mock');
const Chalk = require('chalk');

const Error = debug('mocks:error');
const Log = debug('mocks:log');

const internals = {};

internals.loadApi = function(api) {
    return JSON.parse(api);
};

module.exports.register = function(server, options, next) {
    let routes, basePath;
    Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
    const dbURL = `http://${options.db.host}:${options.db.port}`;
    Log('dbURL: ', Chalk.blue(dbURL));
    const nano = require('nano')(dbURL);
    const db = nano.use(options.db.name);
    options.basedir = options.basedir || process.cwd();
    options.docspath = options.docspath || '/oas';
    options.cors = {
        origin: ['*'],
    };

    // Default mock handler
    const defaulthandler = function(request, reply) {
        let path = request.route.path.replace(options.api.basePath, '');
        let mockOptions = {
            path: path,
            operation: request.method,
            response: '200',
        };
        let Mock = Xmock(options.api, mockOptions);
        Mock.responses(mockOptions)
            .then((mock) => {
                if (mock.responses) {
                    reply(mock.responses);
                } else {
                    reply({'drunken-master-error': 'no mock response found.'});
                }
            }).catch((error) => {
                reply({'drunken-master-error': error})
                    .code(500);
            });
    };

    // Custom "update" method creates a new version in CouchDB
    db.update = function(obj, key, callback) {
        let db = this;
        db.get(key, function(error, existing) {
            if (!error) obj._rev = existing._rev;
            db.insert(obj, key, callback);
        });
    };

    // Initialize dynamic routes
    db.get(options.db.document, function(err, body) {
        if (body && body.spec) {
            options.api = body.spec;
        } else {
            Error(Chalk.red('No spec found! Check your DB.'));
            // options.api = {};
        }

        if (Thing.isString(options.api)) {
            options.api = internals.loadApi(options.api);
        }

        Assert.ok(Thing.isObject(options.api), 'Api definition must resolve to an object.');

        if (options.api.hasOwnProperty('basePath')) {
            options.api.basePath = Utils.prefix(options.api.basePath || '/', '/');
            basePath = Utils.unsuffix(options.api.basePath, '/');

            // Build routes
            routes = builder({
                'baseDir': options.baseDir,
                'api': options.api,
                'schema-extensions': true,
                'defaulthandler': defaulthandler,
            });

            // Add dynamic routes
            routes.forEach(function(route) {
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
            options.api.basePath = '/';
        }

        // Expose plugin api
        server.expose({
            api: options.api,
            setHost: function setHost(host) {
                this.api.host = options.api.host = host;
            },
        });

        // Done
        next();
    });
};

module.exports.register.attributes = {
    pkg: require('./package.json'),
};
