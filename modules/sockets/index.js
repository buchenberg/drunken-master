'use strict';

//DEBUGGING
const debug = require('debug');
const error = debug('sockets:error');
const log = debug('sockets:log');
log.log = console.log.bind(console);

module.exports = {
    register: function (server, options, next) {

        const io = require('socket.io')(server.listener);

        var connections = [];

        io.on('connection', function (socket) {
            connections.push(socket);
            log(`${connections.length} sockets connected`)
            io.emit('connections', connections.length);
            socket.on('disconnect', function() {
                var i = connections.indexOf(socket);
                connections.splice(i, 1);
                io.emit('connections', connections.length);
             });
            socket.on('client message', function (data) {
                log('we got a message:')
                log(data)
            });
        });

        server.expose('updateRevision', function (revision) { return io.emit('revision', revision); });
        server.expose('updateRoutes', function (routes) {
            var dynamic_routes = [];
            routes.map(
                function (route) {
                    dynamic_routes.push({
                        method: route.method,
                        path: route.path
                    });
                }
            );

            return io.emit('dynamic_routes', dynamic_routes); 
        });

        next();


    }
};


module.exports.register.attributes = {
    pkg: require('./package.json')
};

