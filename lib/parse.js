'use strict';

const bemNaming = require('bem-naming');

// special fallback to a string not to be found in a real project
const PARENT_FALLBACK = 'specialfallbacktoastringnottobefoundinarealproject';

function parse(tree, options = {}) {
    const tab = options.tab || '    ';
    const naming = bemNaming(options.naming);

    const lines = tree.split('\n');

    const result = lines.reduce((parsed, line) => {
        if (!line) return parsed;

        const parent = getParent(parsed, getNestingLevel(line, tab));

        line = line.trim();

        const strContent = /^'(.*)'$/.exec(line);
        const jsContent = /^`(.*)`$/.exec(line);

        // remove spaces inside brackets or braces
        line = line
            .replace(/\{.*?\}/g, function(match) {
                return match.replace(/\s/g, '');
            })
            .replace(/\[.*?\]/g, function(match) {
                return match.replace(/\s/g, '');
            });

        const node = strContent && [strContent[1]] ||
            jsContent && ['%%%%%' + jsContent[1] + '%%%%%'] ||
            line.split(/\s+/).reduce(onWord, []);

        function onWord(acc, word) {
            const fields = getFields(word);
            const attrs = getAttrs(word);

            if (fields) {
                word = word.replace(fields[0], '');
            }

            if (attrs) {
                word = word.replace(attrs[0], '');
            }

            if (word.startsWith(naming.elemDelim) || word.startsWith(naming.modDelim)) {
                const prevEntity = acc[acc.length - 1];
                const parentName = prevEntity && (prevEntity.block + (prevEntity.elem ? naming.elemDelim + prevEntity.elem : '')) ||
                    parent && parent.block ||
                    PARENT_FALLBACK;

                word = parentName + word;
            }

            const entity = naming.parse(word) || {};

            if (entity.block === PARENT_FALLBACK) {
                delete entity.block;
            }

            fields && Object.assign(entity, eval('(' + fields[0] + ')'));

            if (attrs) {
                const parsedAttrs = eval(attrs[0].replace('[', '({').replace(']', '})'));
                entity.attrs ?
                     Object.assign(entity.attrs, parsedAttrs) :
                     entity.attrs = parsedAttrs;
            }

            acc.push(entity);

            return acc;
        }

        const bemjson = node2bemjson(node);

        if (parent) {
            if (bemjson.elem && bemjson.block === parent.block) {
                delete bemjson.block;
            }

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
    const bemjson = processMods(node.shift());

    node.forEach(item => {
        if ((item.block && item.block !== bemjson.block) ||
            item.elem !== bemjson.elem ||
            (!item.block && !item.elem)) {
            if (!bemjson.mix) bemjson.mix = [];

            if (item.elem && item.block === bemjson.block) {
                delete item.block;
            }

            bemjson.mix.push(item);
        } else {
            const mods = getMods(item);
            Object.keys(mods).forEach(mod => {
                bemjson[mod] || (bemjson[mod] = {});
                Object.assign(bemjson[mod], mods[mod]);
            });
        }
    });

    processMixes(bemjson);

    if (bemjson.mix && bemjson.mix.length === 1) {
        bemjson.mix = bemjson.mix[0];
    }

    return bemjson.length === 1 ? bemjson[0] : bemjson;
}

// { block: 'b1', modName: 'm1', modVal: 'v1' } -> { m1: 'v1' }
function getMods(entity) {
    if (!entity || !entity.modName) return;
    const result = {};
    const modsField = entity.elem ? 'elemMods' : 'mods';

    result[modsField] = {};
    result[modsField][entity.modName] = entity.modVal;

    return result;
}

// { block: 'b1', modName: 'm1', modVal: 'v1' } -> { block: 'b1', mods: { m1: 'v1' } }
// note: the function mutates passed object
function processMods(entity) {
    Object.assign(entity, getMods(entity));
    delete entity.modName;
    delete entity.modVal;
    return entity;
}

// Process entities like this
// {
//     block: 'b1',
//     mix: [
//         { block: 'b2', modName: 'm1', modVal: 'v1' },
//         { block: 'b2', modName: 'm2', modVal: 'v2' }
//     ]
// }
// into
// {
//     block: 'b1',
//     mix: [
//         { block: 'b2', mods: { m1: 'v1', m2: 'v2' } }
//     ]
// }
function processMixes(entity) {
    if (!entity.mix || !entity.mix.length || entity.mix.length < 2) return entity;

    entity.mix = entity.mix.reduce((acc, mix) => {
        if (!mix.modName) {
            acc.push(mix);
            return acc;
        }

        const hostEntityIdx = acc.findIndex(item => (item.block || item.elem) && item.block === mix.block && item.elem === item.elem);

        if (typeof hostEntityIdx !== 'undefined') {
            const hostEntity = acc[hostEntityIdx];
            const modsField = mix.elem ? 'elemMods' : 'mods';
            hostEntity[modsField] || (hostEntity[modsField] = {});
            hostEntity[modsField][mix.modName] = mix.modVal;
        } else {
            acc.push(processMods(mix));
        }

        return acc;
    }, []);

    return entity;
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
