/**
 * Created by Robin Hsu on 16/4/20.
 */
"use strict";
var webpack = require('webpack');
var HtmlWebpackPluginCustom = require('html-webpack-plugin-custom');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
// var HtmlWebpackPluginCustom = require('./html-webpack-plugin-custom.js');

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