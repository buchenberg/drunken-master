'use strict';
const debug = require('debug')('toast');
var Assert = require('assert');
var Thing = require('core-util-is');
var builder = require('swaggerize-routes');
var Utils = require('./lib/utils');
var Yaml = require('js-yaml');
var Fs = require('fs');
var Mockgen = require('./lib/mockgen.js');

var Swagmock = require('swagmock');





module.exports = {
    register: function (server, options, next) {
        var routes, basePath;

        Assert.ok(Thing.isObject(options), 'Expected options to be an object.');
        const dbURL = `http://${options.db.host}:${options.db.port}`;
        debug('dbURL', dbURL);
        const nano = require('nano')(dbURL);
        const db = nano.use(options.db.name);
        options.basedir = options.basedir || process.cwd();
        options.docspath = Utils.prefix(options.docspath || '/api-docs', '/');



        db.get('swagger', function (err, body) {
            options.api = body.spec;
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
                debug('mock options', mockOptions);

                let responseMock = Mockgen(options.api).responses(mockOptions);
                responseMock.then(mock => {
                    reply(mock);
                }).catch(error => {
                    reply({ 'drunken-master-error': error }).status(599);
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
                path: basePath + options.docspath,
                config: {
                    handler: function (request, reply) {
                        reply(options.api);
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