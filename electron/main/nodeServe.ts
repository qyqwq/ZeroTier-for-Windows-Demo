// let log = require('electron-log/node')
// let { join } = require('node:path')
// log.transports.file.resolvePathFn = () => join(process.cwd(), 'logs/main.log');
// log.transports.file.level = 'info';
// log.info('----------------Log from the NodeProcess process-----------');
import { sendlog } from "../utils/log";
import { onWebContentsSend } from "./index";
const port = 7711; //积积阳阳德

// process.on('message', (message) => {
//   sendlog.log('父进程消息：', message)
// log.info(`父进程消息：${message}`);
// 向父进程发送回复消息
// process.send('Hello from child process!');
// });

// const Koa = require('koa');
// const { koaBody } = require('koa-body');
import Koa from "koa";
import { koaBody } from "koa-body";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const app = new Koa();
//syncNetworkData
app
  .use(koaBody())
  .use(async (ctx, next) => {
    await next();
    let { method, url, body } = ctx.request;
    if (method === "POST" && url === "/syncNetworkData") {
      Object.assign(ctx.response, {
        status: 200,
        body: "已接收",
      });
      onWebContentsSend({
        requestUrl: "syncNetworkData",
        body,
      });
    }
  })
  .use(async (ctx, next) => {
    await next();
    let { method, url, body } = ctx.request;
    if (method === "POST" && url === "/getMemberData") {
      Object.assign(ctx.response, {
        status: 200,
        body: "准备发送成员数据",
      });
      onWebContentsSend({
        requestUrl: "getMemberData",
        body,
      });
    }
  })
  .use(async (ctx, next) => {
    await next();
    let { method, url, body } = ctx.request;
    if (method === "POST" && url === "/uploadFileInfo") {
      Object.assign(ctx.response, {
        status: 200,
        body: "收到文件传输请求",
      });
      Object.assign(ctx.response.header, {
        "Access-Control-Allow-Origin": "*",
      });
      onWebContentsSend({
        requestUrl: "takeUploadFileInfo",
        body,
      });
    }
  });
app.listen(port, () => {
  sendlog.log("Koa start");
});
