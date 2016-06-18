const bemNaming = require('bem-naming');

function parse(tree, options = {}) {
    const tab = options.tab || '    ';
    const naming = bemNaming(options.naming);

    const lines = tree.split('\n');

    const result = lines.reduce((parsed, line) => {
        if (!line) return parsed;

        const parent = getParent(parsed, getNestingLevel(line, tab));

        line = line.trim();

        const strContent = /^'(.*)'$/.exec(line);

        const node = strContent ? [strContent[1]] : line.split(/\s+/).reduce((acc, word) => {
            const fields = getFields(word);
            const attrs = getAttrs(word);

            if (fields) {
                word = word.replace(fields[0], '');
            }

            if (attrs) {
                word = word.replace(attrs[0], '');
            }

            if (word.startsWith(naming.elemDelim) || word.startsWith(naming.modDelim)) {
                word = (parent && parent.block || acc[acc.length - 1].block) + word;
            }

            const entity = naming.parse(word) || {};

            fields && Object.assign(entity, eval('(' + fields[0] + ')'));

            if (attrs) {
                const parsedAttrs = eval(attrs[0].replace('[', '({').replace(']', '})'));
                entity.attrs ?
                     Object.assign(entity.attrs, parsedAttrs) :
                     entity.attrs = parsedAttrs;
            }

            acc.push(entity);

            return acc;
        }, []);

        const bemjson = node2bemjson(node);

        if (parent) {
            parent.content = parent.content ?
                [].concat(parent.content, bemjson) :
                bemjson;
        } else {
            parsed.push(bemjson);
        }

        return parsed;
    }, []);

    return result.length === 1 ? result[0] : result;
};

function getNestingLevel(str, tab) {
    return str.replace(str.trimLeft(), '').length / tab.length;
}

function node2bemjson(node) {
    if (node.length === 1) return node[0];

    const bemjson = node.shift();

    node.forEach(item => {
        if ((item.block && item.block !== bemjson.block) || item.elem !== bemjson.elem) {
            if (!bemjson.mix) bemjson.mix = [];
            bemjson.mix.push(item);
        } else {
            if (!bemjson.mods) bemjson.mods = {};
            bemjson.mods[item.modName] = item.modVal;
        }
    });

    if (bemjson.mix && bemjson.mix.length === 1) {
        bemjson.mix = bemjson.mix[0];
    }

    return bemjson;
}

function getParent(parsed, level) {
    let parent = parsed[parsed.length - 1];

    if (!parent) return;

    for (let i = 0; i < level - 1; i++) {
        parent = Array.isArray(parent.content) ?
            parent.content[parent.content.length - 1] :
            parent.content;
    }

    return parent;
}

function getAttrs(str) {
    return /\[(.*)\]/.exec(str);
}

function getFields(str) {
    return /\{(.*)\}/.exec(str);
}

module.exports = parse;
