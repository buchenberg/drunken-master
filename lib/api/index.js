'use strict';
// DEBUGGING
const debug = require('debug');
const error = debug('routes:error');
const log = debug('routes:log');
log.log = console.log.bind(console);

const Yaml = require('js-yaml');
// const Nano = require('nano');


module.exports = {
    register: function(server, options, next) {
        // Set up couchdb client (nano)
        // const dbURL = `http://${options.db.host}:${options.db.port}`;
        // log('dbURL: ', dbURL);
        // const nano = Nano(dbURL);
        // const db = nano.use(options.db.name);

        options.basedir = options.basedir || process.cwd();
        options.docspath = options.docspath || '/oas';
        options.cors = {
            origin: ['*'],
        };

        // Custom update function
        // db.update = function(obj, key, callback) {
        //     let db = this;
        //     db.get(key, function(error, existing) {
        //         if (!error) obj._rev = existing._rev;
        //         db.insert(obj, key, callback);
        //     });
        // };

        // HEALTH ROUTE
        server.route({
            method: 'GET',
            path: '/health',
            config: {
                handler: function(request, reply) {
                    reply(
                        {'status': 'OK'}
                    ).code(200);
                },
                cors: options.cors,
            },
        });

        next();
    },
};


module.exports.register.attributes = {
    pkg: require('./package.json'),
};
