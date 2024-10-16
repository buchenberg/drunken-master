'use strict';
import debug from "debug";
import wreck from "@hapi/wreck"

const proxyPlugin = {
    name: "proxyPlugin",
    register: async function (server, options) {
        server.events.on('request', (_request, event, tags) => {
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
                mapUri: function(request) {
                    let upstreamUrl = `${options.upstream_protocol}://${options.upstream_url}${request.raw.req.url}`;
                    console.log(`Request to ${upstreamUrl}`);
                    request.headers.host = options.proxy_host_header;
                    return {
                        uri: upstreamUrl
                    };
                },
                onResponse: async function(err, res) {
                    const body  = await wreck.read(res, {
                        json: true,
                        gunzip: true,
                    });
                    return err || body.toString();
                },
            },
        };
    
        server.route({
            method: '*',
            path: '/{path*}',
            config: config,
            handler: handler
        });




    }
};

export default proxyPlugin;

