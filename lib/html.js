const bemhtml = require('./bemhtml');
const parse = require('./parse');

module.exports = function(tree, options = {}) {
    const beautify = typeof options.beautify !== 'undefined' ? options.beautify : {};
    const html = bemhtml.apply(parse(tree, options));

    return beautify ? require('js-beautify').html(html, beautify) : html;
};