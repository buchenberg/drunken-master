'use strict';
const Swagmock = require('swagmock');
let mockgen;

module.exports = function (swagger) {
    /**
     * Cached mock generator
     */
    mockgen = mockgen || Swagmock(swagger);
    return mockgen;
};
