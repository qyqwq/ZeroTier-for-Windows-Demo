import { CodeName } from "@/utils/errcode";
import { useRequest } from "vue-request";
import { sendlog } from "@/utils/log";
let missionCount = 0;
let missionPromise = null;
const timeoutfn = () => {
  // window.nodeAPI.installZero()
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
      sendlog.log("timeout");
    }, 5000);
  });
};
// ==============================================================================
// ==                                   任务调度核心                            ==
// ==============================================================================

const installZero = () => window.nodeAPI.installZero();
const getToken = () => window.nodeAPI.readZerotierToken();
const startService = () => window.nodeAPI.starteZero();
// sendlog.log()

//预设错误修复
let defaultError: Record<string, missionObject> = {
  401: {
    icon: "token",
    name: "验证",
    fn: getToken,
  },
  [CodeName.NoInstall]: {
    icon: "install",
    name: "安装",
    fn: installZero,
    callback(res: any) {
      if (res.status == "success") {
        init();
      }
    },
  },
  [CodeName.NoService]: {
    icon: "start",
    name: "启动",
    fn: startService,
    callback(res: any) {
      if (res.status == "success") {
        init();
      }
    },
  },
};

const missionQuery: Ref<missionObject[]> = ref([]);
const missionNoEmpty = computed(() => {
  return !!missionQuery.value.length;
});
//添加
const addmission = (misObj: missionObject | missionObject[]): void => {
  if (!misObj) {
    // misObj = [...misObjDef]
    return;
  }
  if (Array.isArray(misObj)) {
    missionQuery.value = missionQuery.value.concat(
      misObj.map((e) => ({ ...e, key: missionCount++, finish: false }))
    );
  } else {
    missionQuery.value.push({
      ...misObj,
      key: missionCount++,
      finish: false,
    });
  }
  missionStart();
};
//启动
let misssionLock = false;
const missionStart = async () => {
  if (misssionLock) return;
  misssionLock = true;
  let faild = false;
  while (missionNoEmpty.value && !faild) {
    let mi = missionQuery.value[0];
    let res = await mi.fn();
    // sendlog.log(res)
    console.log(res);
    if (res.status == "success") {
      sendlog.log("任务成功", mi.name);
      mi.finish = true;
      if (typeof mi.callback == "function") {
        mi.callback(res);
      }
      missionQuery.value.shift();
    } else {
      sendlog.log("任务失败", mi.name);
      //执行失败,处理预设错误
      faild = true;
      let code = String(res.code);
      if (defaultError[code]) {
        sendlog.log("错误码", code, "调用自动修复");
        missionQuery.value.unshift({
          ...defaultError[res.code],
          key: missionCount++,
        });
        setTimeout(() => {
          missionStart();
        }, 100);
      } else {
        //无法自动解决的错误,清空任务
        sendlog.log("错误码", code, "无法自动修复");
        mi.finish = true;
        missionQuery.value.forEach((notRunMi) => {
          notRunMi.callback(res);
        });
        missionQuery.value.splice(0);
      }
    }
  }
  misssionLock = false;
};
// const creatMission = (fn: () => Promise<T>): () => Promise<T> => {
//   return addmission(() => fn)
// }
//通过网络id获取网络对象
const getNetworkById = (netId: string) => {
  let net = localJsonData.joinedNetworkList?.find((e) => e.id == netId) || {};
  return net;
};
//通过成员id获取成员
const getMemberById = (net: userNetwork, id: string): netMember | undefined => {
  return net?.memberList?.find((e) => e.id == id);
};
//id 名称 键值对
const nameMap: Ref<Record<string, string>> = computed(() => {
  let map: Record<any, any> = {};
  localJsonData?.joinedNetworkList?.forEach((net) => {
    net?.memberList?.forEach((member: netMember) => {
      let id = member.id as string;
      map[id] = member.name;
    });
  });
  // console.log('nameMap', nameMap)
  return map;
});

// ==============================================================================
// ==                                   本地API请求                                ==
// ==============================================================================

//获取缓存信息
const localJsonData: localJsonDataType = reactive({});
const getLocalJsonData = () =>
  window.nodeAPI.readData().then((res: any) => {
    // sendlog.log(res.data)
    Object.keys(res.data).forEach((key) => {
      localJsonData[key] = res.data[key];
    });
    return res;
  });
//保存到本地json文件
const updateLocalJsonData = () => {
  let json = JSON.parse(JSON.stringify(localJsonData));
  // sendlog.log('保存json文件', json)
  window.nodeAPI.writeData(json);
};
//ZeroTiler信息
const zerotierStatus: Record<string, any> = reactive({});
let statusRequestCount = 0;
const getZeroTierStatus = () => {
  return new Promise((resolve, reject) => {
    const getStatus = () =>
      window.nodeAPI
        .requestApi({
          url: "status",
          method: "get",
        })
        .then((res) => {
          console.log(res.data);
          if (res.status == "success") {
            Object.keys(res.data).forEach((key) => {
              zerotierStatus[key] = res.data[key];
            });
            // sendlog.log(zerotierStatus)
            cancel();
            resolve(res);
          } else {
            if (++statusRequestCount >= 5) {
              // zerotierStatus.id = 'Null'
              cancel();
              reject();
            }
          }
          return res;
        });
    const { run, data, cancel } = useRequest(getStatus, {
      manual: true,
      pollingInterval: 1000,
    });
    run();
  });
};
//加入网络
let errmsg: Record<string, string> = {
  404: "找不到网络",
};
//加入与更新网络
const joinNetwork = (netId: string | number, data: Object) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: "加入",
      icon: "list",
      fn: () =>
        window.nodeAPI.requestApi({
          url: "network/" + netId,
          method: "post",
          data,
        }),
      callback(res: any) {
        if (res.status == "success") {
          //跟新本地网络缓存
          updateLoaclNetwork(res.data);
          resolve(res);
        } else {
          window.$message(errmsg[String(res.code)] || "添加网络失败");
          reject(res);
        }
      },
    });
  });
};
//当前已加入的网络列表
const joinedNetworkList = () =>
  window.nodeAPI
    .requestApi({
      url: "network",
      method: "get",
    })
    .then((res) => {
      sendlog.log("获取当前已加入的网络列表");
      console.log("当前已加入的网络列表", res.data);
      if (res.status == "success" && Array.isArray(res.data)) {
        //更新本地json
        updateLoaclNetwork(res.data);
      }
    });
//更新本地网络列表
const updateLoaclNetwork = (nets: userNetwork | userNetwork[]) => {
  // if (Object.prototype.toString.call(localJsonData.joinedNetworkList) !== '[object Object]') {
  if (!Array.isArray(localJsonData.joinedNetworkList)) {
    localJsonData.joinedNetworkList = reactive([]);
  }
  let arrKeyMap: Record<string, number> = {};
  localJsonData.joinedNetworkList.forEach((n, index) => {
    arrKeyMap[String(n.id)] = index;
  });
  if (Array.isArray(nets)) {
    nets.forEach((n) => {
      let index = arrKeyMap[String(n.id)];
      if (localJsonData.joinedNetworkList) {
        if (index >= 0) {
          Object.assign(localJsonData.joinedNetworkList[index], n);
        } else {
          localJsonData.joinedNetworkList.push(n);
        }
      }
    });
  } else {
    let index = arrKeyMap[String(nets.id)];
    if (index >= 0) {
      Object.assign(localJsonData.joinedNetworkList[index], nets);
    } else {
      localJsonData.joinedNetworkList.push(nets);
    }
  }
  updateLocalJsonData();
  //检查状态是否要轮询
  netStatusPolling();
};
//保存轮询的开关
let netStatusPollingMap: Record<string, any> = {};
const SUCCESS_STATUS = "OK"; //轮询停止状态
let createPolling = (netId: string) => {
  const netWorkDetail = () =>
    window.nodeAPI
      .requestApi({
        url: "network/" + netId,
        method: "get",
      })
      .then((res) => {
        sendlog.log("待授权状态轮询", "id:" + netId);
        // console.log('加入了网络',res.data)
        if (res.data.status === SUCCESS_STATUS) {
          //更新网络
          updateLoaclNetwork(res.data);
          cancel();
        } else if (res.code == 404) {
          cancel();
        }
        return res;
      });
  const { run, cancel } = useRequest(netWorkDetail, {
    manual: true,
    pollingInterval: 2000,
  });
  return { run, cancel };
};
//待授权状态进行轮询
const netStatusPolling = () => {
  let netArr = localJsonData.joinedNetworkList || [];
  netArr.forEach((net) => {
    let { id: netId, status }: { id?: string; status?: string } = net;
    if (!netId) return;
    if (status != SUCCESS_STATUS) {
      if (netStatusPollingMap[netId]) {
        let pollingSwitch = createPolling(netId);
        pollingSwitch.run();
      } else {
        let pollingSwitch = createPolling(netId);
        netStatusPollingMap[netId] = pollingSwitch;
        pollingSwitch.run();
      }
    }
  });
  return;
};
//离开网络
const closeNetwork = (netId: string | number) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: "断开",
      icon: "leave",
      fn: () =>
        window.nodeAPI.requestApi({
          url: "network/" + netId,
          method: "delete",
        }),
      callback(res: any) {
        sendlog.log("离开网络");
        console.log("离开网络", res.data);
        if (res.status == "success") {
          //跟新本地网络缓存
          // updateLoaclNetwork(res.data)
          resolve(res);
        } else {
          window.$message(errmsg[String(res.code)] || "离开网络失败");
          reject(res);
        }
      },
    });
  });
};
//相邻节点列表
const peerList = ref([]);
const getPeerList = () => {
  return new Promise((resolve, reject) => {
    window.nodeAPI
      .requestApi({
        url: "peer",
      })
      .then((res: any) => {
        if ((res.status = res)) {
          sendlog.log("获取相邻节点列表");
          console.log("获取相邻节点列表", res.data);
          peerList.value = res.data;
          resolve("");
        }
      });
  });
};

// ==============================================================================
// ==                                 node服务请求                                ==
// ==============================================================================
//合并adminId
const assignAdminId = (
  netId: string,
  userId?: string,
  type?: "add" | "red"
) => {
  let net = getNetworkById(netId);
  let adminIds = net?.adminIds || reactive([]);
  if (!userId) {
    return [...adminIds];
  }
  type = type || "add";
  let index = adminIds.findIndex((e) => e == userId);
  if (index < 0) {
    type == "add" ? adminIds.push(userId) : "";
  } else {
    type == "red" ? adminIds.splice(index, 1) : "";
  }
  return [...adminIds];
};
//将管理员id设置到网络tag里
const updateNetTag = (netId: string, tag: any[]) => {
  let net = getNetworkById(netId);
  window.nodeAPI
    .requestApi({
      type: "official",
      url: `network/${netId}`,
      method: "POST",
      data: {
        config: { tags: tag },
      },
      headers: {
        Authorization: net.Authorization,
      },
    })
    .then((res) => {
      console.log("更新tag", res);
    });
};
//验证网络管理token
const authAdminToken = (netId: string, token: string) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: "验证",
      icon: "auth",
      fn: () =>
        window.nodeAPI.requestApi({
          type: "official",
          url: "network",
          method: "get",
          headers: {
            Authorization: "token " + token,
          },
        }),
      callback(res: any) {
        // sendlog.log(res)
        if (res.status == "success") {
          if (Array.isArray(res.data)) {
            let isArr = res.data.map((e: any) => String(e.id));
            if (isArr.includes(netId)) {
              let adminIds = assignAdminId(
                netId,
                String(zerotierStatus.address)
              );
              //更新权限token到本地文件
              updateLoaclNetwork({
                id: netId,
                Authorization: "token " + token,
                adminIds,
              });
              //更新网络额外参数
              updateNetTag(netId, ["adminIds", adminIds]);
              resolve(res);
              return;
            }
          }
          window.$message(errmsg[String(res.code)] || "认证失败");
          reject({
            status: "error",
            code: 0,
            data: "认证失败",
          });
        } else {
          window.$message(errmsg[String(res.code)] || "认证失败");
          reject(res);
        }
      },
    });
  });
};

//启动管理员功能的网络
const networkAdminServiceSwitch: Record<string, any> = {};
//重设已启用的功能
const resetNetworkAdminService = (netId: string, service: string) => {
  if (networkAdminServiceSwitch[netId]) {
    if (networkAdminServiceSwitch[netId][service]) {
      networkAdminServiceSwitch[netId][service].cancel();
    }
  } else {
    networkAdminServiceSwitch[netId] = {};
  }
};
//获取网络成员, 同步给其他客户端
const syncNetworkMember = (netId: string) => {
  let net = getNetworkById(netId);
  let Authorization = net.Authorization;
  if (!Authorization) {
    requestNetworkMember(netId);
    return;
  }

  const updateMember = () =>
    window.nodeAPI
      .requestApi({
        type: "official",
        url: `network/${netId}/member`,
        method: "get",
        headers: {
          Authorization,
        },
      })
      .then((res: any) => {
        // sendlog.log('管理员获取网络内成员',res.data)
        let memberList = res.data.map((mem: any) => {
          let { networkId, nodeId, lastSeen, config, name } = mem;
          let { ipAssignments, authorized, id } = config;
          return {
            id,
            authorized,
            lastSeen,
            nodeId,
            networkId,
            name,
            ip: ipAssignments.join(""),
          };
        });
        let memberIps = memberList
          .map((me: any) => {
            if (zerotierStatus.address != me.id) {
              return me.ip;
            } else {
              return "";
            }
          })
          .filter(
            (item: any) => item !== null && item !== undefined && item !== ""
          );
        sendlog.log("管理员获取网络内成员");
        console.log("管理员获取网络内成员", memberList);
        sendlog.log("成员ip", memberIps);
        let adminIds = assignAdminId(netId);
        //更新自己
        updateLoaclNetwork({
          id: netId,
          memberList,
          adminIds,
        });
        memberListUpdateCount.value++;

        console.log({
          url: "/syncNetworkData",
          memberIps,
          data: {
            originId: zerotierStatus.address, //发起人
            netId,
            memberList,
            adminIds,
          },
        });
        //更新别人
        window.nodeAPI.requestMember({
          url: "/syncNetworkData",
          memberIps,
          data: {
            originId: zerotierStatus.address, //发起人
            netId,
            memberList,
            adminIds,
          },
        });
        cancel();
        return res;
      })
      .catch((e) => {
        sendlog.log("获取网络成员报错", e.message);
        cancel();
      });
  //启用轮询
  const { run, cancel } = useRequest(updateMember, {
    manual: true,
    pollingInterval: 1000 * 60 * 10,
  });
  resetNetworkAdminService(netId, "syncNetworkMember");
  networkAdminServiceSwitch[netId]["syncNetworkMember"] = { run, cancel };
  run();
};
//接收网络成员数据
const memberListUpdateCount = ref(0);
const setSyncNetworkData = (data: any) => {
  let {
    adminIds,
    memberList,
    netId,
  }: { adminIds: string[]; memberList: any[]; netId: string } = data;
  updateLoaclNetwork({
    id: netId,
    memberList,
    adminIds,
  });
  memberListUpdateCount.value++;
};
//收到成员的请求
const getMemberData = (data: any) => {
  let { name, netId, id }: { name: string; netId: string; id: string } = data;
  sendlog.log("收到成员数据请求", name);

  checkMemberName(netId, { id, name }).then(() => {
    syncNetworkMember(netId);
  });
};
//向管理员请求网络成员
const requestNetworkMember = (netId: string) => {
  let adminIds = assignAdminId(netId);
  // let promiseList: any[] = []
  let net = getNetworkById(netId);
  adminIds.forEach((id) => {
    let mmeber = getMemberById(net, id);
    let ip = mmeber?.ip?.split(",")[0] || "";
    if (!ip) return;
    window.nodeAPI.requestMember({
      url: "/getMemberData",
      memberIps: [ip],
      data: {
        originId: zerotierStatus.address, //发起人
        netId,
        name: localJsonData.nickname || zerotierStatus.address,
        id: zerotierStatus.address,
      },
    });
  });
};
//检查成员昵称
const checkMemberName = (netId: string, member: netMember) =>
  new Promise((resolve, reject) => {
    let net = getNetworkById(netId);
    let memberLocal = getMemberById(net, String(member.id));
    //昵称不匹配，更新昵称
    if (memberLocal && memberLocal.name != member.name) {
      sendlog.log(
        "昵称不匹配，更新昵称 ",
        `id:${member.id} name:${memberLocal.name} -> ${member.name}`
      );
      if (net.Authorization) {
        sendlog.log("我是管理员，自己更新昵称");
        updateMemberData(netId, member).finally(() => {
          resolve("");
          syncNetworkMember(String(netId)); //管理员要自己同步
        });
      } else {
        sendlog.log("向管理员请求更新昵称");
        requestNetworkMember(netId);
        resolve("");
      }
    } else {
      resolve("");
    }
  });
//更新成员信息
const updateMemberData = (netId: string, member: netMember) =>
  new Promise((resolve, reject) => {
    let net = getNetworkById(netId);
    window.nodeAPI
      .requestApi({
        type: "official",
        url: `network/${netId}/member/${member.id}`,
        method: "POST",
        data: {
          name: member.name,
        },
        headers: {
          Authorization: net.Authorization,
        },
      })
      .finally(() => {
        resolve("");
      });
  });
//授权成员
const memberAuthorized = (
  netId: string,
  memberId: string,
  authorized: Boolean
) =>
  new Promise((resolve, reject) => {
    let net = getNetworkById(netId);
    window.nodeAPI
      .requestApi({
        type: "official",
        url: `network/${netId}/member/${memberId}`,
        method: "POST",
        data: {
          config: {
            authorized,
          },
        },
        headers: {
          Authorization: net.Authorization,
        },
      }).then(res=>{
        resolve(res)
      })
      
  });
//ping一个网络成员
const pingMember = (ip:string)=> new Promise((resolve)=>{
  window.nodeAPI.pingMember(ip).then(res=>{
    // console.log(res.data)
    let showAvg:string = ({
      "0.000": '<1ms',
      "unknown": '--'
    }as Record<string,string>)[res.data.avg] || res.data.avg.replace(/(\d*).(\d*)/,'$1ms')
    resolve(showAvg)
  })
})
//管理员功能
const networkAdminService = () => {
  const service = (net: userNetwork) => {
    syncNetworkMember(String(net.id));
  };
  return new Promise((resolve, reject) => {
    localJsonData.joinedNetworkList?.forEach((net) => {
      if (net.Authorization) {
        service(net);
      }
    });
    resolve("");
  });
};
// ------------------ 文件传输 ------------------------ //
const uploadFileList: Ref<uploadFileType[]> = ref([]); //我上传的文件列表
const takeFileList: Ref<uploadFileType[]> = ref([]); //我接收的文件列表
//文件大小
const showfileSize = (size: number) => {
  let symbolArr = ["Byte", "KB", "MB", "GB", "TB", "PB"];
  let symbolIndex = 0;
  while (size >= 1024 && symbolIndex < symbolArr.length - 1) {
    size = size / 1024;
    size = Number(size.toFixed(2));
    symbolIndex++;
  }
  return String(size) + symbolArr[symbolIndex];
};
const takeUploadFileInfo = (data: any) => {
  let {
    fileName,
    size,
    originId,
    upLoadId,
  }: { fileName: string; size: number; originId: string; upLoadId: string } =
    data;
  let ori = nameMap.value[originId] || originId;
  let showSize = showfileSize(Number(size));
  sendlog.log(`收到来自${ori}的文件请求`, fileName, showSize);
  takeFileList.value.push({
    fileName: fileName,
    size,
    originId,
    takeId: zerotierStatus.address,
    upLoadId,
  });
};
const uploadFileInfo = ({
  file,
  memberIps,
  originId,
  takeId,
}: {
  file: File;
  memberIps: string[];
  originId: string;
  takeId: string;
}) => {
  let upLoadId = file.name + "-" + file.size + "-" + file.lastModified;
  //发送要上传的文件信息
  window.nodeAPI.requestMember({
    url: "/uploadFileInfo",
    memberIps,
    data: {
      fileName: file.name,
      size: file.size,
      originId,
      upLoadId,
    },
  });
  uploadFileList.value.push({
    fileName: file.name,
    size: file.size,
    originId,
    takeId,
    upLoadId,
  });
};

//接收node接口数据
const onNodeServeData = () =>
  new Promise((resolve, reject) => {
    let requestUrlMap: Record<string, any> = {
      //接收网络成员数据
      syncNetworkData: setSyncNetworkData,
      //请求网络成员数据
      getMemberData: getMemberData,
      //文件传输请求
      takeUploadFileInfo: takeUploadFileInfo,
    };
    //接收 网络成员列表消息
    window.nodeAPI.onWebContentsSend((data: any) => {
      // sendlog.log('vue接收到网络成员消息', data)
      let { requestUrl, body }: { requestUrl: string; body: any } = data;
      let fn = requestUrlMap[String(requestUrl)];
      fn(body);
    });
    resolve("");
  });
//
// ================================ 初始化流程 ================================
let initCount = 0;
const init = () => {
  sendlog.log("数据初始化, 次数" + ++initCount);
  //读取本地文件
  //监听node接口
  //获取ZeroTier状态
  //检查已加入的网络
  //检查管理权限
  getLocalJsonData()
    .then(onNodeServeData)
    .then(getToken)
    .then(getZeroTierStatus)
    .then(joinedNetworkList)
    .then(networkAdminService);
};

export default {
  //添加任务 函数
  addmission,
  //任务列表 响应对象
  missionQuery,
  missionNoEmpty,
  // creatMission,

  //--
  init,
  localJsonData,
  updateLocalJsonData,
  zerotierStatus,
  joinNetwork,
  closeNetwork,
  updateLoaclNetwork,
  authAdminToken,
  networkAdminService,
  syncNetworkMember,
  requestNetworkMember,
  checkMemberName,
  updateMemberData,
  memberListUpdateCount,
  peerList,
  getPeerList,
  uploadFileInfo,
  uploadFileList,
  takeFileList,
  nameMap,
  showfileSize,
  memberAuthorized,
  pingMember
};
