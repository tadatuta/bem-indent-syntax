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
    footer
`,
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
                            block: 'main',
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
                            block: 'main',
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
    b2
`,
        expected: {
            block: 'b1',
            content: [
                {
                    block: 'b1',
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
        expected: { block: 'b1', mix: { block: 'b1', elem: 'e1' } }
    },
    {
        tmpl: `b1
    __e1`,
        expected: { block: 'b1', content: { block: 'b1', elem: 'e1' } }
    },
    {
        tmpl: `b1
    b2
        __e2`,
        expected: {
            block: 'b1',
            content: {
                block: 'b2',
                content: {
                    block: 'b2',
                    elem: 'e2'
                }
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
    b1__e1
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
    'text content'`
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
    }
];

parseTests.forEach(test => {
    assert.deepEqual(bis.parse(test.tmpl, test.options || {}), test.expected);
});

serializeTests.forEach(test => {
    assert.deepEqual(bis.serialize(test.bemjson, test.options || {}), test.expected);
});
