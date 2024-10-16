import { Server, Request, ResponseToolkit } from "@hapi/hapi";
import Builder from "swaggerize-routes";
import Xmock from "x-mock";
import Path from "path";
import Glue from "@hapi/glue";
import H2O2 from '@hapi/h2o2';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import { hostname } from "os";

const nyan = `
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::##############                              :::::::::::::::::::
############################  ##############################  :::::::::::::::::
#########################  ######???????????????????????######  :::::::::::::::
=========================  ####??????????()????()?????????####  :::::::::::::::
=========================  ##????()??????????????    ()?????##  ::::    :::::::
------------=============  ##??????????????????  ;;;;  ?????##  ::  ;;;;  :::::
-------------------------  ##??????????()??????  ;;;;;;?????##    ;;;;;;  :::::
-------------------------  ##??????????????????  ;;;;;;         ;;;;;;;;  :::::
++++++++++++-------------  ##??????????????????  ;;;;;;;;;;;;;;;;;;;;;;;  :::::
+++++++++++++++++++++++++  ##????????????()??  ;;;;;;;;;;;;;;;;;;;;;;;;;;;  :::
+++++++++++++++++    ;;;;  ##??()????????????  ;;;;;;@@  ;;;;;;;;@@  ;;;;;  :::
~~~~~~~~~~~~~++++;;;;;;;;  ##????????????????  ;;;;;;    ;;;  ;;;    ;;;;;  :::
~~~~~~~~~~~~~~~  ;;  ~~~~  ####??????()??????  ;;[];;;;;;;;;;;;;;;;;;;;;[]  :::
$$$$$$$$$$$$$~~~~  ~~~~~~  ######?????????????  ;;;;;;              ;;;;  :::::
$$$$$$$$$$$$$$$$$$$$$$$$$    ###################  ;;;;;;;;;;;;;;;;;;;;  :::::::
$$$$$$$$$$$$$$$$$$$$$$$  ;;;;                                       :::::::::::
:::::::::::::$$$$$$$$$$  ;;;;  ::  ;;  ::::::::::::  ;;  ::  ;;;;  ::::::::::::
:::::::::::::::::::::::      ::::::    :::::::::::::     ::::      ::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
`;


// Load environmental variables or suitable defaults
const environment = {
    tls: process.env.TLS || false,
    api: {
        host: process.env.API_HOST || 'localhost',
        port: process.env.API_PORT || 9990,
    },
    ui: {
        host: process.env.UI_HOST || 'localhost',
        port: process.env.UI_PORT || 9990,
    },
    ws: {
        port: process.env.WS_PORT || 9991,
    },
    proxy: {
        upstream_host: process.env.PROXY_UPSTREAM_HOST,
        upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL,
        header_host: process.env.PROXY_HEADER_HOST,
    },

};

// const manifest = {
//     server: {},
//     connections: [
//         {
//             host: environment.api.host,
//             port: environment.api.port,
//             labels: 'api',
//             tls: environment.tls,
//             routes: {
//                 cors: {
//                     origin: ['*'],
//                 },
//                 files: {
//                     relativeTo: Path.join(__dirname, 'lib/ui/build'),
//                 },
//             },

//         },
//     ],
//     registrations: [
//         {
//             plugin: 'h2o2',
//         },
//         {
//             plugin: 'inert',
//         },
//         {
//             plugin: 'vision',
//         },
//         {
//             plugin: {
//                 register: './lib/proxy',
//                 options: {
//                     upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL || 'https',
//                     upstream_url: process.env.PROXY_UPSTREAM_HOST || 'public.dev-spectrum.net',
//                     proxy_host_header: process.env.PROXY_HOST_HEADER || 'figaro.dev-spectrum.net',
//                 },
//             },
//         },
//         {
//             plugin: {
//                 register: './lib/mocks',
//                 options: {
//                     baseDir: Path.resolve('./lib/mocks'),
//                     docspath: '/docs',
//                 },
//             }
//         },
//         {
//             plugin: {
//                 register: './lib/ui',
//                 options: {
//                     cors: {
//                         origin: ['*'],
//                     },
//                 },
//             },
//         },
//     ],
// };

const manifest = {
    server: {
        port: 3000,
        host: "localhost",
        routes: {
            files: {
                relativeTo: __dirname
            }
        }
    },
    register: {
        plugins: [
            H2O2,
            Inert,
            Vision,
            './mocks',
            {
                plugin: './proxy',
                options: {
                    upstream_protocol: process.env.PROXY_UPSTREAM_PROTOCOL || 'https',
                    upstream_url: process.env.PROXY_UPSTREAM_HOST || 'google.com',
                    proxy_host_header: process.env.PROXY_HOST_HEADER || 'google.com',
                },
            },
            {
                plugin: "./pub",
                options: {
                    cors: {
                        origin: ['*'],
                    },
                },
            },
        ]
    }
};

const options = {
    relativeTo: __dirname
};

const init = async function () {
    try {
        const server = await Glue.compose(manifest, options);
        const today = new Date();
        await server.start();
        console.log(nyan);

        console.log("Nyan! So much hapi.");
        console.log();
        console.log(today.toTimeString());
        console.log('Server running on %s', server.info.uri);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};

init();