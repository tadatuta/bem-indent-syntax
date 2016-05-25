const assert = require('assert');
const bis = require('..');

const tests = [
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

tests.forEach(test => {
    assert.deepEqual(bis.parse(test.tmpl), test.expected);
});
