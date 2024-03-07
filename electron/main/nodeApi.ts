import { ipcMain } from "electron";
import fs from "node:fs/promises";
import axios from "axios";
import { spawn, fork, exec } from "node:child_process";
import path from "path";
import { errcodeMatch, CodeName } from "../utils/errcode";
import { nodejsRequest } from "../electron-env";
import { sendlog } from "../utils/log";
import { onWebContentsSend } from "./index";
import "./nodeServe";

const localHref = "http://localhost:9993/";
const officialHref = "https://api.zerotier.com/api/v1/";
const childServePost = 7711;

const errreg = new RegExp(Object.keys(errcodeMatch).join("|"), "ig");
// 读取token存起来
let zeroToken = "";
ipcMain.handle("readZerotierToken", async () => {
  sendlog.log("读取到token", zeroToken);
  return new Promise((resolve, reject) => {
    if (zeroToken) {
      resolve({
        status: "success",
        code: 200,
        data: { token: zeroToken },
      });
      return;
    }
    fs.readFile("C:\\ProgramData\\ZeroTier\\One\\authtoken.secret", "utf-8")
      .then((data: string) => {
        zeroToken = data;
        resolve({
          status: "success",
          code: 200,
          data: { token: data },
        });
      })
      .catch((e) => {
        zeroToken = "";
        resolve({
          status: "error",
          // code: 0,
          code: CodeName.NoInstall,
          data: {},
        });
      });
  });
});

//发送请求 import('axios').AxiosRequestConfig
ipcMain.handle("requestApi", async (event, option: nodejsRequest) => {
  // sendlog.log(option)
  // return errcodeevent
  let { url, method = "get", params, data, headers, type = "local" } = option;
  let baseurl = localHref;
  let baseHeaders: {} = {
    "X-ZT1-Auth": zeroToken,
  };
  if (type == "official") {
    baseurl = officialHref;
    baseHeaders = {};
  }
  return new Promise((resolve, reject) => {
    axios({
      url: baseurl + url,
      method,
      headers: {
        ...baseHeaders,
        ...headers,
      },
      params,
      data,
    })
      .then((res) => {
        resolve({
          status: "success",
          code: 200,
          data: res.data,
        });
      })
      .catch((e) => {
        sendlog.error("requestApi", e.message, e.request.url);
        // sendlog.log(e)
        let mat = e.message.match(errreg) || [];
        let code = errcodeMatch[mat[0]] || e.response.status;
        resolve({
          status: "error",
          code,
          data: e.message,
        });
      });
  });
});

//安装
ipcMain.handle("installZero", () => {
  return new Promise((resolve, reject) => {
    const executablePath = process.cwd() + "\\ZeroTier One.msi";
    const childProcess = spawn("msiexec", ["/i", executablePath, "/passive"]);
    childProcess.stderr.on("data", (data) => {
      sendlog.error(`stderr: ${data}`);
      resolve({
        status: "error",
        code: 0,
        data,
      });
    });
    childProcess.on("close", (code) => {
      sendlog.log(`安装程序退出 code ${code}`);
      if(code == 0){
        resolve({
          status: "success",
          code: 200,
          data: {},
        });
        return 
      }
      resolve({
        status: "error",
        code: 0,
        data:{},
      });
    });
  });
});
let mearkJsonStr = "";
let jsonPath = path.resolve(process.cwd(), "netData.json");
//读取备注文件
ipcMain.handle("readData", async () => {
  return new Promise((resolve, reject) => {
    if (mearkJsonStr.length > 2) {
      resolve({
        status: "success",
        code: 200,
        data: JSON.parse(mearkJsonStr),
      });
      return;
    }
    fs.readFile(jsonPath, "utf8")
      .then((content) => {
        mearkJsonStr = content;
        const data = JSON.parse(content || "{}");
        // sendlog.log(data);
        resolve({
          status: "success",
          code: 200,
          data,
        });
      })
      .catch((err) => {
        sendlog.error(err);
        resolve({
          status: "success",
          code: 200,
          data: {},
        });
      });
  });
});
//写入备注文件
ipcMain.handle("writeData", async (event, json) => {
  return new Promise((resolve, reject) => {
    // sendlog.log('写入json文件')
    // sendlog.log(json)
    mearkJsonStr = JSON.stringify(json);
    fs.writeFile(jsonPath, mearkJsonStr, "utf8")
      .then((content) => {
        resolve({
          status: "success",
          code: 200,
          data: {},
        });
      })
      .catch((err) => {
        sendlog.error(err);
        resolve({
          status: "success",
          code: 200,
          data: {},
        });
      });
  });
});
//启动服务
ipcMain.handle("starteZero", () => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn("net", ["start", "ZeroTier"]);
    childProcess.stderr.on("data", (data) => {
      // sendlog.log(typeof data,data.__proto__,data)
      // data = new TextDecoder('gbk').decode(data)
      // sendlog.error(`stderr: ${data}`);
      resolve({
        status: "error",
        // code: 0,
        code: CodeName.NoInstall,
        data: data,
      });
    });
    childProcess.on("close", (code) => {
      // sendlog.log(`Child process exited with code ${code}`);
      resolve({
        status: "success",
        code: 200,
        data: {},
      });
    });
  });
});
//向网络成员发送请求
ipcMain.handle("requestMember", async (event, oriData: any) => {
  return new Promise((resolve, reject) => {
    let {
      url: apiurl,
      memberIps = [],
      data,
    }: { url: string; memberIps: []; data: any } = oriData;
    memberIps.forEach((ip) => {
      let url = `http://${ip}:${childServePost}${apiurl}`;
      // let url = `http://172.25.170.224:${childServePost}/syncNetworkData`
      sendlog.log("向网络成员发送请求", url);
      axios({
        url,
        method: "post",
        data,
      })
        .then((res) => {
          sendlog.log(ip + "回信", res.data);
        })
        .catch(() => {});
    });
    resolve({
      status: "success",
      code: 200,
      data: "",
    });
  });
});
//添加中转服务器
ipcMain.handle("addTransit", async (event, serveId) => {
  return new Promise((resolve, reject) => {
    // let cmd = `zerotier-cli orbit ${serveId} ${serveId}`;
    let cmd = `${path.join(process.cwd(),'bat/setMoon.bat')} ${serveId}`

    sendlog.log("中转服务器设置", cmd);
    const childProcess = exec(cmd);

    childProcess.stderr.on("data", (data) => {
      sendlog.log("中转服务器设置失败", data);
      resolve({
        status: "error",
        // code: 0,
        code: 0,
        data: data,
      });
    });
    childProcess.on("close", (code) => {
      if(code == 0){
        sendlog.log("中转服务器设置成功");
        resolve({
          status: "success",
          code: 200,
          data: {},
        });
        return 
      }
      resolve({
        status: "error",
        // code: 0,
        code: 0,
        data: data,
      });
    });
  });
});

// let jsPath = path.join(process.cwd(), '/electron/main/nodeServe.cjs')
// sendlog.log('准备启动Koa服务, 程序路径', jsPath)
// try {
//   //子进程启动node服务端
//   const childServe = fork(jsPath)

//   childServe.on('message', (message) => {
//     sendlog.log('子进程消息：');
//     // sendlog.log(`子进程消息：`,message);
//     onWebContentsSend(message)
//   });
// } catch (error) {
//   sendlog.log(error)
//   // let data = new TextDecoder('gbk').decode(error.message)
//   // sendlog.log(data)
// }

/**
 *  (get) /status 获取状态
 *
 *  ---Joined Networks 加入网络分类---
 *  (get) /network  获取加入的网络列表
 *  (get) /network/{network_id} 加入网络
 *  (post) /network/{network_id} 加入或修改网络
 *  (delete) /network/{network_id} 离开网络
 *
 *  ---Peers 对等点分类---
 *  (get) /peer 获取对等点列表
 *  (get) /peer/{network_id} 加入对等点
 *
 *  ---Controller 控制分类---
 *  (get) /controller 控制器状态
 *  (get) /controller/network 网络ID列表
 *  (post) /controller/network 生成随机网络ID
 *  (get) /controller/network/{network_id} 获取网络详情
 *  (post) /controller/network/{network_id} 创建或更新网络
 *  (delete) /controller/network/{network_id} 删除网络
 *  (get) /controller/network/{network_id}/member 获取网络成员
 *  (get) /controller/network/{network_id}/member/{node_id} 获取成员信息
 *  (post) /controller/network/{network_id}/member/{node_id} 创建或更新成员
 *  (delete) /controller/network/{network_id}/member/{node_id} 删除成员
 *
 *  ---Controller 不稳定---
 *  (get) /unstable/controller/network 列出所有网络
 *  (get) /unstable/controller/network/{network_id}/member 列出所有网络
 *
 * cd C:\ProgramData\ZeroTier\One
 * zerotier-idtool initmoon identity.public >>moon.json
 * zerotier-idtool genmoon moon.json
 * moons.d
 * zerotier-cli orbit
 * zerotier-cli listpeers
 *
 * 00000092be7fc041
 */
