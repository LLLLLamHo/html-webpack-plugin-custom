/**
 * Created by Lam on 17/2/27.
 */

const path = require('path');

function HtmlWebpackPluginCustom(options) {
    this.options = options || {marks: []};
    this.markFormat = ['{&','','&}']
    this.specialStr = ['$','(',')','*','+','.','[',']','?','^','{','}','|'];
    console.log('go my plugin');
}

HtmlWebpackPluginCustom.prototype.apply = function(compiler) {
    let _this = this;
    compiler.plugin('compilation', function(compilation) {


        compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback) {

            //html文件路径
            _this.fileName = path.join(path.resolve(__dirname) + '/dist/' + htmlPluginData.outputName);
            //资源数组
            _this.staticList = [];
            //当前处理的html文件的outputPath
            _this.currOutPutPath = htmlPluginData.outputName;
            //处理当前文件的相关资源
            let assetJson_JS = htmlPluginData.assets.js,
                assetJson_CSS = htmlPluginData.assets.css;

            for(let i = 0,len = assetJson_JS.length;i < len;i++){
                _this.staticList.push(assetJson_JS[i]);
            }

            for(let i = 0,len = assetJson_CSS.length;i < len;i++){
                _this.staticList.push(assetJson_CSS[i]);
            }

            initOpt(_this,function(arg1,data) {
                callback(arg1,data);
            },htmlPluginData);
        });

    });


};

//初始化opt,需要做一些正则表达式的初始化
function initOpt(_this,callback,htmlPluginData) {
    let marks = _this.options.marks;
    if(marks.length == 0)return false;

    for(let i = 0,len = marks.length;i < len; i++){

        if(marks[i].fileName == _this.currOutPutPath){

            let newOpt = initRegExp(_this,marks[i]);
            marks[i] = newOpt;

        }else{
            continue;
        }

    }

    replaceHtmlContent(_this,callback,htmlPluginData);

}

//初始化对应正则表达式
function initRegExp(_this,opt){
    let newOpt = Object.assign({},opt),
        marks_JS = newOpt.markNames_JS ? newOpt.markNames_JS : [],
        marks_CSS = newOpt.markNames_CSS ? newOpt.markNames_CSS : [];

    newOpt.staticRegExps = [];
    newOpt.markRegExps = [];

    for(let i = 0,len = marks_JS.length;i < len;i++){
        let currMark = marks_JS[i],
            currMarkRegExp = `${_this.markFormat[0]}${currMark}${_this.markFormat[2]}`;
        newOpt.markRegExps.push(currMarkRegExp);

        //获取mark中对应的资源路径
        let staticPath = checkStaticListHaveMark(_this,currMark);
        if(staticPath) {
            let temporaryObj = {};
            temporaryObj[currMarkRegExp] = setStaticRegExp(_this,staticPath,'JavaScript');
            newOpt.staticRegExps.push(temporaryObj);
        }else{
            break;
        }

    }

    for(let i = 0,len = marks_CSS.length;i < len;i++){
        let currMark = marks_CSS[i],
            currMarkRegExp = `${_this.markFormat[0]}${currMark}${_this.markFormat[2]}`;
        newOpt.markRegExps.push(currMarkRegExp);

        //获取mark中对应的资源路径
        let staticPath = checkStaticListHaveMark(_this,currMark);
        if(staticPath) {
            let temporaryObj = {};
            temporaryObj[currMarkRegExp] = setStaticRegExp(_this,staticPath,'Style');
            newOpt.staticRegExps.push(temporaryObj);
        }else{
            break;
        }

    }

    return newOpt;
}

//判断对应的资源表中是否存在有对应名字的mark名字
function checkStaticListHaveMark(_this,markName){
    let staticList = _this.staticList;
    for(let i = 0,len = staticList.length;i < len;i++){
        if(staticList[i].indexOf(markName) != -1){
            return staticList[i];
        }
    }
    return false;
}

//组装资源正则
function setStaticRegExp(_this,staticPath,type) {

    let regexpStaticPath = transformPath(_this,staticPath);
    if(type == 'JavaScript'){
        return new RegExp('<script[^>].*src=[\'\"]?('+regexpStaticPath+')[\'\"]?.*>[.\n]*<\/script>');
    }else if(type == 'Style'){
        return new RegExp('<link[^>].*href=[\'\"]?('+regexpStaticPath+')[\'\"]?.*>');
    }
}


//正则需要额外转义特殊标点符号
function transformPath(_this,path) {
    let pathArr = path.split('');
    for(var i = 0,len = pathArr.length; i < len;i++ ){

        for(var k = 0; k < _this.specialStr.length; k++){
            if(pathArr[i] == _this.specialStr[k]){
                pathArr[i] = "\\" + pathArr[i];
            }

        }

    }

    return pathArr.join('');
}

function replaceHtmlContent(_this,callback,htmlPluginData) {

    let html = htmlPluginData.html,
        resultHtml = '';

    for(let i = 0,markLen = _this.options.marks.length;i < markLen;i++){
        let currMark = _this.options.marks[i];

        if(currMark.fileName != htmlPluginData.outputName)continue;

        for(let k = 0,staticLen = currMark.staticRegExps.length;k < staticLen;k++){

            let regObj = currMark.staticRegExps[k];

            for(let key in regObj){
                let reg = regObj[key],
                    markIndex = key;
                let result = html.match(reg);
                if(!!result){

                    let start = parseInt(result.index),
                        end = start + parseInt(result[0].length);

                    //如果resultHtml不等于空,就等于之前已经替换过,则不再使用html而是继续更改resultHtml
                    if(resultHtml != ''){
                        let static = resultHtml.slice(start,end),
                            beforeReplaceHtml = resultHtml.replace(static,'');

                        resultHtml = beforeReplaceHtml.replace(markIndex,static);
                    }else{
                        let static = html.slice(start,end),
                            beforeReplaceHtml = html.replace(static,'');

                        resultHtml = beforeReplaceHtml.replace(markIndex,static);
                    }

                }
            }

        }
    }
    htmlPluginData.html = resultHtml == '' ? html : resultHtml;
    callback(null,htmlPluginData);
}

module.exports = HtmlWebpackPluginCustom;