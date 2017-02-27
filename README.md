HTML Webpack Plugin Custom
===================
[![npm](https://img.shields.io/npm/v/guido.svg)](https://www.npmjs.com/package/html-webpack-plugin-custom)

这是一个基于[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)扩展的[webpack](http://webpack.github.io/)插件,为了在webpack打包输出带有静态资源的html的时候实现自定义静态资源的位置。
在原来的html-webpack-plugin是没有办法很好的自定义一个静态资源的位置自定义的,所以通过在html里面编写占位符,通过特定的配置,实现静态资源利用占位符定位位置,从而实现位置的替换。

Installation
------------
项目依赖安装:
```shell
$ npm install html-webpack-plugin-custom --save-dev
```
全局安装:
```shell
$ npm install html-webpack-plugin-custom -g
```

还有一些第三方的插件也同样为html-webpack-plugin进行扩展的。
-------------

 * [webpack-subresource-integrity](https://www.npmjs.com/package/webpack-subresource-integrity) for enhanced asset security
 * [appcache-webpack-plugin](https://github.com/lettertwo/appcache-webpack-plugin) for iOS and Android offline usage
 * [favicons-webpack-plugin](https://github.com/jantimon/favicons-webpack-plugin) which generates favicons and icons for iOS, Android and desktop browsers
 * [html-webpack-harddisk-plugin](https://github.com/jantimon/html-webpack-harddisk-plugin)
 * [html-webpack-inline-source-plugin](https://github.com/DustinJackson/html-webpack-inline-source-plugin) to inline your assets in the resulting HTML file
 * [html-webpack-exclude-assets-plugin](https://github.com/jamesjieye/html-webpack-exclude-assets-plugin) for excluding assets using regular expressions 
 * [html-webpack-include-assets-plugin](https://github.com/jharris4/html-webpack-include-assets-plugin) for including lists of js or css file paths (such as those copied by the copy-webpack-plugin).
 * [script-ext-html-webpack-plugin](https://github.com/numical/script-ext-html-webpack-plugin) to add `async`, `defer` or `module` attributes to your`<script>` elements, or even in-line them
 * [style-ext-html-webpack-plugin](https://github.com/numical/style-ext-html-webpack-plugin) to convert your `<link>`s to external stylesheets into `<style>` elements containing internal CSS
 * [resource-hints-webpack-plugin](https://github.com/jantimon/resource-hints-webpack-plugin) to add resource hints for faster initial page loads
 
如何使用
------------

在test里面有详细的用法demo,已经使用与不使用的比较

```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>demo</title>
    </head>
    <body>
        {&demo.all.css&}
        {&demo.all.js&}
        <div id="root"></div>
    </body>
    </html>
```

html里面我自定义了一种格式的占位符,{&...&}。

```javascript
    {
        plugins: [
            new HtmlWebpackPluginCustom({
                marks : [
                    {
                        fileName : 'html/plugin_demo.html',
                        markNames_JS : ['demo.all.js'],
                        markNames_CSS : ['demo.all.css']
                    }
                ]
            })
        ]
    }
```

在webpack中直接在plugins里面实例化出来,传入对应的参数。

唯一的参数就是一个对象,对象里面只有唯一一个键值,就是marks对象。
marks是一个数组,里面是针对每个页面的占位符的对象组。

- `fileName`: 该属性就是对应的html-webpack-plugin插件里面的`filename`。
- `markNames_JS`: 该属性是一个数组,里面存放着对应在模板中的占位符中的字符串(js)。
- `markNames_CSS`: 该属性是一个数组,里面存放着对应在模板中的占位符中的字符串(css)。


完整的webpack.config配置

```javascript
"use strict";
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackPluginCustom = require('./html-webpack-plugin-custom.js');

const list = require('./HtmlWebpackPluginData.js');

let config = {
    devtool: 'source-map',
    context: __dirname + '/src',
    entry: {
        demo: './js/index.js',

        // vendors: ['react', 'react-dom', 'es6-promise', 'isomorphic-fetch']//第三方库
    },
    output: {
        path: __dirname + '/dist',
        filename: 'js/[name].all.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                    plugins: ['transform-decorators-legacy']
                }
            },
            {
                test: /\.handlebars$/,
                loader: "handlebars-loader"
            },
            {
                test: /\.css$/,
                loader: "style!css!px2rem?remUnit=50&remPrecision=8"
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!px2rem?remUnit=100&remPrecision=8!sass?outputStyle=expanded')
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/[name].all.css', {//抽出css
            disable: false,
            allChunks: true
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new HtmlWebpackPluginCustom({
            marks : [
                {
                    fileName : 'html/plugin_demo.html',
                    markNames_JS : ['demo.all.js'],
                    markNames_CSS : ['demo.all.css']
                }
            ]
        })
    ]
};


list.map((e,i) => {
    let defaultOpt = {
        inject:true,
        hash:true
    };
    let data = Object.assign({},defaultOpt,e)
    const htmlPlugin =  new HtmlWebpackPlugin(data);
    config.plugins.push(htmlPlugin);
})

module.exports = config;
```

HtmlWebpackPluginData.js
```javascript
module.exports = [
    {
        filename: `html/normal_demo.html`,
        template: `./html/normal_demo.html`,
        chunks: ['demo'],
    },
    {
        filename: `html/plugin_demo.html`,
        template: `./html/plugin_demo.html`,
        chunks: ['demo'],
    },
]
```

