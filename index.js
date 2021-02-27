#!/usr/bin/env node
const fs =require('fs')
const path = require("path")
const SpritesmithPlugin = require('webpack-spritesmith')
const imageInfo = require("imageinfo")
const join =require('path').join
const webpack = require('webpack')
var ProgressBar = require('progress');

// var bar = new ProgressBar('progress: [:bar]', { total: 50, width: 10, complete: '*' });

// var timer = setInterval(function () {
//   bar.tick(5);  //进度步长
//   if (bar.complete) {
//     console.log('\ncomplete\n');
//     clearInterval(timer);
//   }
// }, 100);

start()
function start(){
    var arguments = process.argv.splice(2)
    console.log("开始检测路径：",arguments[0])
    try{
        let files = fs.readdirSync(join(arguments[0]));
        console.log("检测到"+files.length+'个文件！')
        if(arguments[0]&&arguments[0].length){
            startspritesmith(arguments[0])
        }
    }catch{
        console.log("请检查路径！！！")
    }
}

async function startspritesmith(pathurl){
    let res = await  unifiedFile(pathurl)
    console.log("开始进行合并～")
    let resmege = await  merge(res,pathurl)
    if(resmege){
    console.log('精灵图合并完毕～')
    }
    return true
}
function unifiedFile(pathurl){
    return new Promise((res,rej)=>{
    let typelist= getChangeFiles(pathurl, [`.png`,'.jpeg'], `.jpg`);
     res(typelist)
    })
}

function merge(typelist,pathurl){
    return new Promise((res,rej)=>{
     typelist.forEach(val => {
         webpack({
             plugins:[
                 new SpritesmithPlugin({
                     src: {
                         cwd: path.resolve(pathurl),
                         glob: '*.'+val
                     },
                     target: {
                         image: path.resolve(pathurl+'/spirit-cli/spirit.'+val),
                         css: path.resolve(pathurl+'/spirit-cli/spirit.'+val+'.css')
                     },
                     apiOptions: {
                         cssImageRef: "./spirit."+val
                     }
                 })
             ]
         }, function (err, stats) {
             if(!err){
                 res(true)
             }
             if (err) throw err
           })
     });
    })
 }

async function readFileList (path, filesList) {
    let fileTypeList = []
    filesList = filesList || [];
    let files = fs.readdirSync( join(path));
    files.forEach(function (filename, index) {
        try{
            let valdata= fs.readFileSync(join(path+filename))
            let info = imageInfo(valdata)
            if(!info){ return }
            let filenameList=filename.split('.')
            const fileLast=filenameList[filenameList.length-1]
            filenameList[filenameList.length-1] = info.format.toLocaleLowerCase()
            if(fileTypeList.indexOf(info.format.toLocaleLowerCase())==-1){
                   fileTypeList.push(info.format.toLocaleLowerCase())
            }
            if( fileLast.toLocaleUpperCase() != info.format ){
                rename(path+filename, path+filenameList.join('.'), filename, filenameList.join('.'));
            }
        }catch{

        }
    })
    return fileTypeList
}

function rename (oldPath, newPath, filename, newSuffixFile) {
    fs.rename(oldPath, newPath, function(err) {
        if (err) {
            throw err;
        }
        console.log(`检测到${filename} 需修改为 => ${newSuffixFile}，已经修改完成`)
    });
}

function getChangeFiles (path, oldSuffix, newSuffix) {
    if(!oldSuffix && !newSuffix){
        console.log(`后缀未设置`);
    }
    if(path.indexOf(path.length-1)!='/'){
        path+='/'
    }
   return  readFileList(path)

}