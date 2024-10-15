import { Server, Request, ResponseToolkit } from "@hapi/hapi";
import Builder from "swaggerize-routes";
import Xmock from "x-mock";
import { specs } from "./oas";

// const routes = Builder({
//     'baseDir': options.baseDir,
//     'api': oas,
//     'schema-extensions': true,
//     'defaulthandler': function (request, reply) {
//         let path = request.route.path.replace(oas.basePath, '');
//         let mockOptions = {
//             path: path,
//             operation: request.method,
//             response: '200',
//         };
//         let Mock = Xmock(oas, { 'mixins': Mixins });
//         Mock.response(mockOptions)
//             .then((mock) => {
//                 if (mock) {
//                     reply(mock);
//                 } else {
//                     reply({ 'drunken-master-error': 'no mock response found.' })
//                     .code(500);
//                 }
//             }).catch((error) => {
//                 reply({ 'drunken-master-error': error })
//                 .code(500);
//             });
//     },
// });



const init = async () => {
    specs.forEach(function (spec) {
        console.log(spec);
    });
    const server: Server = new Server({
        port: 3000,
        host: 'localhost'
    });
    server.route({
        method: 'GET',
        path: '/',
        handler: (request: Request, h: ResponseToolkit) => {
            return 'Hello World!';
        }
    });
    // GET OAS METADATA
    server.route({
        method: 'GET',
        path: '/oas',
        handler: function (request, reply) {
            let json = [];
            // Oas.specs.forEach(function (spec) {
            //     json.push({
            //         "title": spec.title,
            //         "path": spec.docpath
            //     })
            // })
            return json;;
        },
        //vhost: options.vhost,
    });


    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});


init();