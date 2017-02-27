/**
 * Created by Lam on 17/2/23.
 */
const path = require('path');
const webpack = require('webpack');
let webpackConfig = require('./webpack.config.js');


function doneHandler(err, stats) {
}


let compiler = webpack(webpackConfig);

compiler.run(doneHandler);




