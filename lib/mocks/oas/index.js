'use strict';

module.exports.specs = [
        {
            "title": "Petstore API",
            "docpath": "/docs/petstore",
            "oas": require('./petstore.json')
        },
        {
            "title": "Uber API",
            "docpath": "/docs/uber",
            "oas": require('./uber.json')
        }
]