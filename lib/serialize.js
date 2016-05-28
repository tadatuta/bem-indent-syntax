const naming = require('bem-naming');
const stringifyObj = require('stringify-object');

function serialize(bemjson) {
    let tree = '';
    let deep = 0;
    let parent;

    walk(bemjson);

    function walk(node) {
        if (typeof node === 'string') return tree += getIndent(deep) + `'${node}'`;
        if (Array.isArray(node)) return node.forEach(walk);

        if (!node.block && parent) {
            node.block = parent;
        }

        let mods = Object.keys(node.mods || {}).map(mod => {
            return naming.stringify({
                block: node.block,
                elem: node.elem,
                modName: mod,
                modVal: node.mods[mod]
            });
        }).join(' ');

        let mix = [].concat(node.mix).map(item => naming.stringify(item)).join(' ');

        let attrs = node.attrs && stringifyObj(node.attrs, { indent: '' })
            .replace(/\s/g, '')
            .replace(/\n/g, '')
            .replace(/^\{/, '[')
            .replace(/\}$/, ']');

        let fields = Object.keys(node).reduce((akk, field) => {
            if (['block', 'elem', 'mods', 'attrs', 'mix', 'cls', 'content'].indexOf(field) < 0) {
                akk[field] = node[field];
            }

            return akk;
        }, {});

        tree +=
            getIndent(deep) +
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

    return tree;
}

function getIndent(deep) {
    const tab = '    ';
    let indent = '';

    for (let i = 0; i < deep; i++) {
        indent += tab;
    }

    return indent;
}

module.exports = serialize;
