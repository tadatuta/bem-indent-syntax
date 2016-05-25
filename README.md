# bem-indent-syntax

BEM tree indentation syntax.

Converts

```
page{title:'ololo',blah:'kuku'}
    header header_type_main b2 b4
    main
        main__e1[color:'red']
            'i am text content'
            'moar'
        main__e2
    footer
```

into

```js
{
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
```

## Usage

```js
require('bem-indent-syntax').parse('b1'); // { block: 'b1' }
```
