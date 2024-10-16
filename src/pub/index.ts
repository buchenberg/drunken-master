const uiPlugin = {
    name: "uiPlugin",
    register: async function (server, options) {
        options.cors = {
            origin: ['*'],
        };



        // // Root redirect
        // server.route({
        //     method: 'GET',
        //     path: '/',
        //     config: {
        //         handler: function (request, h) {
        //             return h.redirect('/ui/#');
        //         },
        //         cors: options.cors
        //     }

        // });

        // UI route
        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: 'pub',
                    index: ['index.html'],
                    redirectToSlash: true
                },
            },
        });





    }
};

export default uiPlugin;