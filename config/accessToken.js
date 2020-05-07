/*
  获取access_token ：
    是什么？微信调用接口全局唯一凭据
    
    特点：
      1. 唯一的
      2. 有效期为2小时，提前5分钟请求
      3. 接口权限 每天2000次
      
    请求地址：
      https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    请求方式：
      GET
    
    设计思路：
      1. 首次本地没有，发送请求获取access_token，保存下来（本地文件）
      2. 第二次或以后：
        - 先去本地读取文件，判断它是否过期
          - 过期了
            - 重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
          - 没有过期
            - 直接使用
     
     整理思路：
       读取本地文件（readAccessToken）
          - 本地有文件
            - 判断它是否过期(isValidAccessToken)
              - 过期了
                - 重新请求获取access_token(getAccessToken)，保存下来覆盖之前的文件（保证文件是唯一的）(saveAccessToken)
              - 没有过期
                - 直接使用
          - 本地没有文件
            - 发送请求获取access_token(getAccessToken)，保存下来（本地文件）(saveAccessToken)，直接使用
 */
const rp = require('request-promise-native');
const fs = require("fs");
const { appID, appsecret } = require("./index");
const path = require("path");
class WeChat {
  saveAccessToke(accessToke) {
  
    return new Promise((resolve, reject) => {
    //  console.log("33333333333")
      var fileName = path.join(__dirname, "saveAccessToke.txt");

    //  console.log("accessToke  ", accessToke);
      //重新赋值凭据的过期时间 ： 当前时间 + (7200 - 5分钟) * 1000
      accessToke.expires_in = Date.now() + 300 * 1000;
      accessToke = JSON.stringify(accessToke);
      fs.writeFile(fileName, accessToke, err => {
        if(err){
          reject();
        }
        resolve(accessToke);
      });
    })
  }
  getAccessToke() {
    return new Promise((resolve, reject) => {
      //console.log("11111");
      //const url=`http://localhost:9998/hello/hello`;
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
      console.log("发送请求");
      rp({ method: 'GET', json: true, url }).then(res => {
      //  console.log("res1112221===>", res);
        //throw Error();
        resolve(res);
      }).catch(err => {
      //  console.log("222222");
        //console.log("err===>", err);
        reject(err);
      })
    })
  }
  isValidAccessToken(data) {
     console.log(data.expires_in <Date.now());
    if (data.expires_in <Date.now()) {
      return false;
    }
    return true;
  }
  readAccessToken() {
    return new Promise((resolve, reject) => {
      var filePath = path.join(__dirname, "saveAccessToke.txt");
      fs.exists(filePath,err=>{
        if(!err){
           reject("fileNotFound");
           //console.log("555555  ",err);
           return;
        }else{
          //console.log("66666666");
          fs.readFile(filePath, (err, bytesRead) => {
            var data = JSON.parse(bytesRead)
            resolve(data);
          });
        }
      })
      
    });
  }
  fetchTicket(){
    return new Promise((resole,reject)=>{
      this.readAccessToken().then(data=>{
       
        var flag= this.isValidAccessToken(data);
       // console.log("flag==>  ",flag);
        if(flag){
          resole(data);
        }else{
          this.getAccessToke().then(data=>{
            this.saveAccessToke(data).then(res=>{
             resole(data);
            });
          
          })
        }
     }).catch(err=>{
       this.getAccessToke().then(data=>{
        // console.log("  ===",data);
         this.saveAccessToke(data).then(res=>{
          //console.log("  ====>",res);
          resole(data);
         });
        
       })
     })
    });
  }
}

const weChat = new WeChat();


var jsstr = {
  "access_token": '32_u2FSSY7F-ZalqeBVA7h4dEHIp9rhjPJLn0G1dLukUXqkftpl4SzOc2aAYOQ2dfs0nTAoivB0n1xjFoXQ5WqbZM86_j0luzdCfFh2oO4ievu0KG0AIv_aVupD0SXdmqdF-FNLwsspxxiKThhbOLPdAEAURV',
  "expires_in": 7200
};
/* weChat.saveAccessToke(jsstr)
  .then(data => {
    console.log("data 写入成功===>");
  }) */

weChat.fetchTicket().then(res=>{
  console.log("fetchTicket==>",res);
});

//console.log("比较大小",("get"==="GET"),("get"=="GET"),("get"=="get"),("Get"=="GET"),(34=="34"))
