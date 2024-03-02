
import { CodeName } from '@/../electron/utils/errcode';
import { useRequest } from 'vue-request';
let missionCount = 0;
let missionPromise = null;
const timeoutfn = () => {
  // window.nodeAPI.installZero()
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
      console.log('timeout')
    }, 5000)
  })
}
// ==============================================================================
// ==                                   任务调度核心                            ==
// ==============================================================================

const installZero = () => window.nodeAPI.installZero()
const getToken = () => window.nodeAPI.readZerotierToken()
const startService = () => window.nodeAPI.starteZero()
// console.log(new TextDecoder('gbk').decode(e.data))

//预设错误修复
let defaultError: Record<string, missionObject> = {
  401: {
    icon: '/token.svg',
    name: '验证',
    fn: getToken,
  },
  [CodeName.NoInstall]: {
    icon: '/install.svg',
    name: '安装',
    fn: installZero,
    callback() {
      statusController()
    }
  },
  [CodeName.NoService]: {
    icon: '/start.svg',
    name: '启动',
    fn: startService,
    callback() {
      statusController()
    }
  }
}

const missionQuery: Ref<missionObject[]> = ref([])
const missionNoEmpty = computed(() => {
  return !!missionQuery.value.length
})
//添加
const addmission = (misObj: missionObject | missionObject[]): void => {
  if (!misObj) {
    // misObj = [...misObjDef]
    return
  }
  if (Array.isArray(misObj)) {
    missionQuery.value = missionQuery.value.concat(misObj.map(e => ({ ...e, key: missionCount++, finish: false })))
  } else {
    missionQuery.value.push({
      ...misObj,
      key: missionCount++,
      finish: false
    })
  }
  missionStart()
}
//启动
let misssionLock = false
const missionStart = async () => {
  if (misssionLock) return
  misssionLock = true
  let faild = false
  while (missionNoEmpty.value && !faild) {
    let mi = missionQuery.value[0]
    let res = await mi.fn();
    console.log(res)
    if (res.status == 'success') {
      console.log('任务成功')
      mi.finish = true
      if (typeof mi.callback == 'function') {
        mi.callback(res)
      }
      missionQuery.value.shift()
    } else {
      console.log('任务失败')
      //执行失败,处理预设错误
      faild = true
      let code = String(res.code)
      if (defaultError[code]) {
        console.log('错误码', code, '调用自动修复')
        missionQuery.value.unshift({ ...defaultError[res.code], key: missionCount++ })
        setTimeout(() => {
          missionStart()
        }, 100)
      } else {
        //无法自动解决的错误,清空任务
        console.log('错误码', code, '无法自动修复')
        mi.finish = true
        missionQuery.value.forEach(notRunMi => {
          notRunMi.callback(res)
        })
        missionQuery.value.splice(0)
      }
    }
  }
  misssionLock = false
}
// const creatMission = (fn: () => Promise<T>): () => Promise<T> => {
//   return addmission(() => fn)
// }

// ==============================================================================
// ==                                   业务逻辑                                ==
// ==============================================================================

//获取缓存信息
const localJsonData: localJsonDataType = reactive({})
const getLocalJsonData = () => window.nodeAPI.readData().then((res: any) => {
  console.log(res.data)
  Object.keys(res.data).forEach(key => {
    localJsonData[key] = res.data[key]
  })
  return res
})
//保存到本地json文件
const updateLocalJsonData = () => {
  let json = JSON.parse(JSON.stringify(localJsonData))
  window.nodeAPI.writeData(json)
}
//ZeroTiler信息
const zerotierStatus: Record<string, any> = reactive({})
let statusRequestCount = 0
const getZeroTierStatus = () => {
  return new Promise((resolve, reject) => {
    const getStatus = () => window.nodeAPI.requestApi({
      url: 'status',
      method: 'get'
    }).then(res => {
      console.log(res.data)
      if (res.status == 'success') {
        Object.keys(res.data).forEach(key => {
          zerotierStatus[key] = res.data[key]
        })
        // console.log(zerotierStatus)
        cancel()
        resolve()
      } else {
        getToken()
        if (++statusRequestCount >= 5) {
          // zerotierStatus.id = 'Null'
          cancel()
          reject()
        }
      }
      return res
    })
    const { run, data, cancel } = useRequest(getStatus, {
      manual: true,
      pollingInterval: 3000
    });
    run()
  })
}
//加入网络
let errmsg: Record<string, string> = {
  404: '找不到网络'
}
//更新本地网络列表
const updateLoaclNetwork = (nets: userNetwork | userNetwork[]) => {
  // if (Object.prototype.toString.call(localJsonData.joinedNetworkList) !== '[object Object]') {
  if (!Array.isArray(localJsonData.joinedNetworkList)) {
    localJsonData.joinedNetworkList = reactive([])
  }
  let arrKeyMap = {}
  localJsonData.joinedNetworkList.forEach((n, index) => {
    arrKeyMap[n.id] = index
  })
  if (Array.isArray(nets)) {
    nets.forEach(n => {
      let index = arrKeyMap[n.id]
      if (index >= 0) {
        localJsonData.joinedNetworkList[index] = n
      } else {
        localJsonData.joinedNetworkList.push(n)
      }
    })
  } else {
    let index = arrKeyMap[nets.id]
    if (index >= 0) {
      localJsonData.joinedNetworkList[index] = nets
    } else {
      localJsonData.joinedNetworkList.push(nets)
    }
  }
  updateLocalJsonData()
}
//加入与更新网络
const joinNetwork = (networkId: string | number, data: Object) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: '加入',
      icon: '/list.svg',
      fn: () => window.nodeAPI.requestApi({
        url: 'network/' + networkId,
        method: 'post',
        data
      }),
      callback(res: any) {
        if (res.status == 'success') {
          //跟新本地网络缓存
          updateLoaclNetwork(res.data)
          resolve(res)
        } else {
          window.$message(errmsg[String(res.code)] || '添加网络失败')
          reject(res)
        }
      }
    })
  })
}
//离开网络
const closeNetwork = (networkId: string | number) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: '断开',
      icon: '/leave.svg',
      fn: () => window.nodeAPI.requestApi({
        url: 'network/' + networkId,
        method: 'delete'
      }),
      callback(res: any) {
        console.log('离开网络', res.data)
        if (res.status == 'success') {
          //跟新本地网络缓存
          // updateLoaclNetwork(res.data)
          resolve(res)
        } else {
          window.$message(errmsg[String(res.code)] || '离开网络失败')
          reject(res)
        }
      }
    })
  })
}

//当前已加入的网络列表
const joinedNetworkList = () => window.nodeAPI.requestApi({
  url: 'network',
  method: 'get'
}).then(res => {
  console.log(res.data)
  if (res.status == 'success' && Array.isArray(res.data)) {
    //更新本地json
    updateLoaclNetwork(res.data)
  }
})
// ================================ 初始化流程 ================================
const init = () => {
  //读取本地文件//获取ZeroTier状态 //检查已加入的网络
  getLocalJsonData().then(getZeroTierStatus).then(joinedNetworkList)
}
init()
export default {
  //添加任务 函数
  addmission,
  //任务列表 响应对象
  missionQuery,
  missionNoEmpty,
  // creatMission,

  //--
  localJsonData,
  updateLocalJsonData,
  zerotierStatus,
  joinNetwork,
  closeNetwork,
  updateLoaclNetwork
}