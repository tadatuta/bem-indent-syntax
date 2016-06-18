# bem-indent-syntax

BEM tree indentation syntax.

## Usage

```js
var bis = require('bem-indent-syntax'),
    // default options
    options = {
        tag: '    ',
        // for naming conf see https://github.com/bem-sdk/bem-naming#custom-naming-convention
        naming: { elem: '__', mod: { name: '_', val: '_' } },
        // for beautify conf see https://www.npmjs.com/package/js-beautify#css--html
        beautify: {}
    };

bis.parse('b1', options); // { block: 'b1' }
bis.stringify('b1', options); // '{ block: 'b1' }'
bis.serialize({ block: 'b1' }, options); // 'b1'
bis.html(`b1
    b2__e1`, options) // <div class="b1">
                      //     <div class="b2__e1"></div>
                      // </div>`
```

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
and vice versa.

Please refer [tests](test/index.js) for some more examples.
