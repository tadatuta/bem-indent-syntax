'use strict';

const stringifyObj = require('stringify-object');
const parse = require('./parse');

module.exports = function(tree, options = {}) {
    options.indent || (options.indent = options.tab || '    ');

    const bemjson = parse(tree, options);
    return typeof bemjson === 'string' ? bemjson : stringifyObj(bemjson, options);
};