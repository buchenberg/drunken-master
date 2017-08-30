'use strict';

module.exports = {
    register: function (server, options, next) {
        options.cors = {
            origin: ['*']
        },

        // UI route
        server.route({
            method: 'GET',
            path: '/ui/{file*}',
            handler: {
                directory: {
                    path: '.',
                    redirectToSlash: true
                }
            },
            config: {
                cors: options.cors
            }
        });

        next();


    }
};


module.exports.register.attributes = {
    pkg: require('./package.json')
};