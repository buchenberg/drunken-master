import Builder from 'swaggerize-routes';
import Utils from './lib/utils';
import Xmock from 'x-mock';
import Oas from './oas';
import Mixins from './lib/mixins';


const mocksPlugin = {
    name: "mocksPlugin",
    register: async function (server, options) {
        options.basedir = options.basedir || process.cwd();
        options.docspath = options.docspath || '/oas';
        options.cors = {
            origin: ['*'],
        };
        Oas.forEach(function (spec) {
            const oas = spec.oas;
            server.route({
                method: 'GET',
                path: spec.docpath,
                config: {
                    json: {
                        space: 2,
                    },
                    handler: function () {
                        return oas;
                    },
                    cors: options.cors,
                },
                vhost: options.vhost,
            });

            if (oas.hasOwnProperty('basePath')) {
                oas.basePath = Utils.prefix(oas.basePath || '/', '/');
                // Build routes
                const routes = Builder({
                    api: oas,
                    handlers: '.',
                    defaulthandler: async function (request) {
                        let path = request.route.path.replace(oas.basePath, '');
                        let mockOptions = {
                            path: path,
                            operation: request.method,
                            response: '200',
                        };
                        const mock = await Xmock(oas, { 'mixins': Mixins })
                            .response(mockOptions);
                        return mock.body;
                    },
                });
                // Add routes
                routes.forEach(function (route) {
                    // Define the dynamic route
                    server.route({
                        method: route.method,
                        path: route.path,
                        vhost: options.vhost,
                        config: {
                            json: {
                                space: 2,
                            },
                            handler: route.handler,
                            cors: options.cors,
                            // Needed for legacy cookies that violate RFC 6265
                            state: {
                                parse: false,
                                failAction: 'ignore',
                            },
                        },
                    });
                });
            } else {
                oas.basePath = '/';
            }
        });

        // Expose plugin api
        server.expose({
            specs: Oas
        });

        server.route({
            method: 'GET',
            path: '/oas',
            handler: function () {
                return Oas.map((spec) => {
                    return {
                        "title": spec.title,
                        "path": spec.docpath
                    }
                });
            }
        });



    }
};

export default mocksPlugin;


