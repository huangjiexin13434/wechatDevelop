
const express= require("express");

const configWechat=require("./config/wechat");  //微信配置
const app= express();


app.use(configWechat());
app.listen(3000,()=>{
   
    console.log("服务器已经启动");
})

