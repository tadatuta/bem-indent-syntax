'use strict';

const bemNaming = require('bem-naming');
const stringifyObj = require('stringify-object');
const PARENT_FALLBACK = 'specialfallbacktoastringnottobefoundinarealproject';

function serialize(bemjson, options = {}) {
    const naming = bemNaming(options.naming);
    let tree = '';
    let deep = 0;
    let parent;

    walk(bemjson);

    function walk(node) {
        if (typeof node === 'string') return tree += getIndent(deep, options.tab) + `'${node}'\n`;
        if (Array.isArray(node)) return node.forEach(walk);

        if (!node.block) {
            node.block = PARENT_FALLBACK;
        }

        const mods = Object.keys(node.mods || {}).map(mod => {
            return naming.stringify({
                block: node.block,
                elem: node.elem,
                modName: mod,
                modVal: node.mods[mod]
            });
        }).join(' ');

        const mix = [].concat(node.mix).map(item => naming.stringify(item)).join(' ');

        const attrs = node.attrs && stringifyObj(node.attrs, { indent: '' })
            .replace(/\s/g, '')
            .replace(/\n/g, '')
            .replace(/^\{/, '[')
            .replace(/\}$/, ']');

        const fields = Object.keys(node).reduce((akk, field) => {
            if (['block', 'elem', 'mods', 'attrs', 'mix', 'cls', 'content'].indexOf(field) < 0) {
                akk[field] = node[field];
            }

            return akk;
        }, {});

        tree +=
            getIndent(deep, options.tab) +
            naming.stringify(node) +
            (mods ? ' ' + mods : '') +
            (mix ? ' ' + mix : '') +
            (node.cls || '') +
            (Object.keys(fields).length ?
                stringifyObj(fields, { indent: '' })
                    .replace(/\s/g, '')
                    .replace(/\n/g, '') :
                '') +
            (attrs || '') +
            '\n';

        if (node.content) {
            node.block && (parent = node.block);
            deep += 1;
            walk(node.content);
            deep -= 1;
            parent = null;
        }
    }

    return tree.replace(new RegExp(PARENT_FALLBACK, 'g'), '');
}

function getIndent(deep, tab = '    ') {
    let indent = '';

    for (let i = 0; i < deep; i++) {
        indent += tab;
    }

    return indent;
}

module.exports = serialize;
