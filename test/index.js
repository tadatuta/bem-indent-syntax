const assert = require('assert');
const bis = require('..');

const parseTests = [
    {
        tmpl: `
page{title:'ololo',blah:'kuku'}
    header header_type_main b2 b4
    main
        main__e1[color:'red']
            'i am text content'
            'moar'
        main__e2
    footer`,
        expected: {
            block: 'page',
            title: 'ololo',
            blah: 'kuku',
            content: [
                {
                    block: 'header',
                    mods: {
                        type: 'main'
                    },
                    mix: [
                        {
                            'block': 'b2'
                        },
                        {
                            'block': 'b4'
                        }
                    ]
                },
                {
                    block: 'main',
                    content: [
                        {
                            elem: 'e1',
                            attrs: {
                                color: 'red'
                            },
                            content: [
                                'i am text content',
                                'moar'
                            ]
                        },
                        {
                            elem: 'e2'
                        }
                    ]
                },
                {
                    block: 'footer'
                }
            ]
        }
    },
    {
        tmpl: 'b1',
        expected: { block: 'b1' }
    },
    {
        tmpl: `
b1
    b1__e1
    b2`,
        expected: {
            block: 'b1',
            content: [
                {
                    elem: 'e1'
                },
                {
                    block: 'b2'
                }
            ]
        }
    },
    {
        tmpl: 'b1 b1--m1',
        expected: { block: 'b1', mods: { m1: true } },
        options: { naming: 'two-dashes' }
    },
    {
        tmpl: 'b1 _m1',
        expected: { block: 'b1', mods: { m1: true } }
    },
    {
        tmpl: 'b1 __e1',
        expected: { block: 'b1', mix: { elem: 'e1' } }
    },
    {
        tmpl: `b1
    __e1`,
        expected: { block: 'b1', content: { elem: 'e1' } }
    },
    {
        tmpl: `b1
    b2
        __e2`,
        expected: {
            block: 'b1',
            content: {
                block: 'b2',
                content: { elem: 'e2' }
            }
        }
    },
    {
        tmpl: `{tag:'div'}`,
        expected: {
            tag: 'div'
        }
    },
    {
        tmpl: `['data-bem':'test']`,
        expected: {
            attrs: { 'data-bem': 'test' }
        }
    },
    {
        tmpl: `{tag:'div'} {tag:'span'}`,
        expected: {
            tag: 'div',
            mix: {
                tag: 'span'
            }
        }
    },
    {
        tmpl: `b1{tag:'div'} b2{tag:'span'}`,
        expected: {
            block: 'b1',
            tag: 'div',
            mix: {
                block: 'b2',
                tag: 'span'
            }
        }
    },
    {
        tmpl: `[tag:'div'] [tag:'span']`,
        expected: {
            attrs: { tag: 'div' },
            mix: {
                attrs: { tag: 'span' }
            }
        }
    },
    {
        tmpl: `b1{ field1: 'val1', field2: 'val2' }`,
        expected: {
            block: 'b1',
            field1: 'val1',
            field2: 'val2'
        }
    },
    {
        tmpl: `b1{field1: 'val1', field2:'val2' }`,
        expected: {
            block: 'b1',
            field1: 'val1',
            field2: 'val2'
        }
    },
    {
        tmpl: `b1[ field1: 'val1', field2: 'val2' ]`,
        expected: {
            block: 'b1',
            attrs: {
                field1: 'val1',
                field2: 'val2'
            }
        }
    },
    {
        tmpl: `b1
    b2__e1`,
        expected: {
            block: 'b1',
            content: {
                block: 'b2',
                elem: 'e1'
            }
        }
    },
    {
        tmpl: '__elem_mod_val',
        expected: {
            elem: 'elem',
            elemMods: {
                mod: 'val'
            }
        }
    },
    {
        tmpl: 'b1 b2 _type_list _view_main',
        expected: {
            block: 'b1',
            mix: { block: 'b2', mods: { type: 'list', view: 'main' } }
        }
    },
    {
        tmpl: 'header _type_main _view_list b2 b4 _type_list _view_main',
        expected: {
            block: 'header',
            mods: { type: 'main', view: 'list' },
            mix: [
                { block: 'b2' },
                { block: 'b4', mods: { type: 'list', view: 'main' } }
            ]
        }
    }
];

const stringifyTests = [
    {
        tmpl: `b1
    b2__e1`,
        expected: `{
    block: 'b1',
    content: {
        block: 'b2',
        elem: 'e1'
    }
}`
    }
];

const serializeTests = [
    {
        bemjson: {
            block: 'b1',
            content: {
                elem: 'e1'
            }
        },
        expected: `b1
    __e1
`
    },
    {
        bemjson: {
            block: 'b1',
            content: [
                {
                    block: 'b2',
                    mods: { m1: 'v1', m2: true },
                    mix: { block: 'b4', elem: 'e1' }
                },
                {
                    block: 'b3',
                    blah: 'ololo',
                    yo: 'blah',
                    attrs: { 'data-bem': 'ololo' }
                },
                'text content'
            ]
        },
        expected: `b1
    b2 b2_m1_v1 b2_m2 b4__e1
    b3{blah:'ololo',yo:'blah'}['data-bem':'ololo']
    'text content'
`
    },
    {
        bemjson: {
            block: 'b1',
            mods: { m1: true }
        },
        expected: `b1 b1--m1
`,
        options: {
            naming: 'two-dashes'
        }
    },
    {
        bemjson: {
            block: 'page',
            title: 'ololo',
            blah: 'kuku',
            content: [
                {
                    block: 'header',
                    mods: {
                        type: 'main'
                    },
                    mix: [
                        {
                            'block': 'b2'
                        },
                        {
                            'block': 'b4'
                        }
                    ]
                },
                {
                    block: 'main',
                    content: [
                        {
                            elem: 'e1',
                            attrs: {
                                color: 'red'
                            },
                            content: [
                                'i am text content',
                                'moar'
                            ]
                        },
                        {
                            elem: 'e2'
                        }
                    ]
                },
                {
                    block: 'footer'
                }
            ]
        },
        expected: `page{title:'ololo',blah:'kuku'}
    header header_type_main b2 b4
    main
        __e1[color:'red']
            'i am text content'
            'moar'
        __e2
    footer
`
    }
];

const bis2htmlTests = [
    {
        tmpl: `b1
    b2__e1`,
        expected: `<div class="b1">
    <div class="b2__e1"></div>
</div>`
    }
];

parseTests.forEach(test => {
    try {
        assert.deepEqual(bis.parse(test.tmpl, test.options || {}), test.expected);
    } catch(err) {
        console.log('Error in parsing', test.tmpl);
        console.log('Expected:');
        console.dir(bis.parse(test.tmpl, test.options || {}), { depth: null });
        console.log('to be:');
        console.dir(test.expected, { depth: null });
        throw new Error(err);
    }
});

stringifyTests.forEach(test => {
    assert.deepEqual(bis.stringify(test.tmpl, test.options || {}), test.expected);
});

serializeTests.forEach(test => {
    assert.deepEqual(bis.serialize(test.bemjson, test.options || {}), test.expected);
});

bis2htmlTests.forEach(test => {
    assert.deepEqual(bis.html(test.tmpl, test.options || {}), test.expected);
});
