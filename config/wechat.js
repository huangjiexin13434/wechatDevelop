
const config=require("./index");
const sha1= require("sha1");
const tools=require("../utlis/tools")
/**
 * { signature: '6b727bad5e8f6f92a4597a2af6d87ea8289cbb8f',
  echostr: '7717115755463702623',
  timestamp: '1588174940',
  nonce: '135155733' }
 */

/**
 * 1）将token、timestamp、nonce三个参数进行字典序排序 2）将三个参数字符串拼接成一个字符串进行sha1加密
 *  3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
 */

module.exports = () => {
    return async (req ,res, next) =>{

      if(req.method=='GET'){
          const { signature, echostr,timestamp,nonce }=req.query;
          const {appID,appsecret,token}=config;
          //console.log(signature, echostr,timestamp,nonce);
          const str=[token,timestamp,nonce];
          const strSort= str.sort().join("");  //字典顺序排序
          //console.log("strSort====>",strSort);
          const sha= sha1(strSort);
          //console.log("加密后sha====>",sha);
          console.log("signature是否是微信端发来的",sha==signature);

         // res.send("success");
      }else if(req.method=='POST'){
          var data= await tools.getUserDataAsync(req);
          res.end("结束了");
          console.log("data  ",data)
      }
    }
}
