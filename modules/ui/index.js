'use strict';

module.exports = {
    register: function (server, options, next) {
        options.cors = {
            origin: ['*']
        },

        // Root redirect
        server.route({
            method: 'GET',
            path: '/',
            config: {
                handler: function (request, reply) {
                    reply().redirect('/ui');
                },
                cors: options.cors
            }

        });

        // UI route
        server.route({
            method: 'GET',
            path: '/ui/{file*}',
            config: {
                handler: {
                    directory: {
                        path: '.',
                        redirectToSlash: true
                    }
                },
                cors: options.cors
            }
        });

        next();


    }
};


module.exports.register.attributes = {
    pkg: require('./package.json')
};