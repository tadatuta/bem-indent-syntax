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
    }
];

const serializeTests = [
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
    }
];

parseTests.forEach(test => {
    assert.deepEqual(bis.parse(test.tmpl), test.expected);
});

serializeTests.forEach(test => {
    assert.deepEqual(bis.serialize(test.bemjson), test.expected);
});
