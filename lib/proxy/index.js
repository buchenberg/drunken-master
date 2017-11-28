'use strict';
const debug = require('debug')('proxy');
const wreck = require('wreck');
exports.register = function(server, options, next) {
    server.on('request-internal', (request, event, tags) => {
        if (tags.error && tags.state) {
            debug(`Error parsing cookie: ${JSON.stringify(event.data.errors, null, 2)}`);
        }
    });

    const config = {
        payload: {
            parse: false,
        },
        // Needed for legacy cookies that violate RFC 6265
        state: {
            parse: false,
            failAction: 'ignore',
        },
    };

    const handler = {
        proxy: {
            passThrough: true,
            mapUri: function(request, callback) {
                let upstreamUrl = `${options.upstream_protocol}://${options.upstream_url}${request.raw.req.url}`;
                debug(`Request to ${upstreamUrl}`);
                request.headers.host = options.proxy_host_header;
                callback(null, upstreamUrl, request.headers);
            },
            onResponse: function(err, res, request, reply) {
                // wreck.read(res, {
                //     json: true,
                //     gunzip: true,
                // }, function(err, payload) {
                //     let upstreamUrl = `${options.upstream_protocol}://${options.upstream_url}${request.raw.req.url}`;
                //     debug(`Response from ${upstreamUrl}:`, payload);
                // });
                reply(err || res);
            },
        },
    };

    server.route({
        method: '*',
        path: '/{path*}',
        config: config,
        handler: handler,
    });

    next();
};
exports.register.attributes = {
    pkg: require('./package.json'),
};
