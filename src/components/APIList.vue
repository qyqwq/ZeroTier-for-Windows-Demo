<script setup lang="ts">
const getToken = () => window.nodeAPI.readZerotierToken()
// console.log(window.ipcRenderer)
const getStatus = () => {
  window.nodeAPI.requestApi({
    url: 'status',
    method: 'get'
  }).then(res => {
    console.log(res.data)
  })
};
// "e674d84c5463a98a"
let newNetwork: Ref<any> = ref({})
let chooseNetworkId = ref('')
let chooseMemberId = ref('')
let networkMemberList = ref({})
let networkList = ref([])
const postNetwork = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network',
    method: 'post',
    data: {
      "name": "鸡巴",
      "enableBroadcast": true,
      "mtu": 1280,
      "dns": {
        "domain": "https://www.alidns.com/",
        "servers": [
          "192.168.31.1",
          "218.85.157.99",
          "218.85.152.99"
        ]
      },
      "private": true,
      "ipAssignmentPools": [
        {
          "ipRangeStart": "192.168.55.10/8",
          "ipRangeEnd": "192.168.55.254/8"
        }
      ],
      // "v4AssignMode": {
      //   "zt": true
      // },
      v4AssignMode: 'zt',
      "v6AssignMode": {
        "6plane": true,
        "rfc4193": true,
        "zt": true
      },
      "multicastLimit": 0,
      "routes": [
        {
          "target": "192.168.31.1/24",
          "via": null
        }
      ]
    }
  }).then(res => {
    newNetwork.value = res.data
    chooseNetworkId.value = res.data.id
  })
};
const postNetworkId = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value,
    method: 'post',
    data: {
      "name": "阿里云鸡巴",
      "enableBroadcast": true,
      "mtu": 2800,
      "dns": {
        "domain": "https://www.alidns.com/",
        "servers": [
          "192.168.31.1",
          "218.85.157.99",
          "218.85.152.99"
        ]
      },
      "private": false,
      "ipAssignmentPools": [
        {
          "ipRangeStart": "172.26.0.1",
          "ipRangeEnd": "172.26.255.254"
        }
      ],
      "v4AssignMode": {
        "zt": true
      },
      // v4AssignMode:'zt',
      "v6AssignMode": {
        "6plane": false,
        "rfc4193": false,
        "zt": false
      },
      "multicastLimit": 0,
      "routes": [
        {
          "target": "172.26.0.0/16",
          "via": "172.26.251.197"
        },{
          "target": "172.26.0.0/16",
          "via": "local"
        },{
          "target": "172.26.0.0/16",
          "via": "127.0.0.1"
        }
      ]
    }
  }).then(res => {
  })
};

const deleteNetwork = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value,
    method: 'delete'
  }).then(res => {
    console.log(res.data)
  })
};
const getNetworkMember = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value + '/member',
    method: 'get'
  }).then(res => {
    console.log(res.data)
    networkMemberList.value = res.data
  })
};
const getNetworkMemberDetail = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value + '/member/' + chooseMemberId.value,
    method: 'get'
  }).then(res => {
    console.log(res.data)
    ipAssignments.value = res.data.ipAssignments.join(',')
  })
};
let ipAssignments = ref('')
const authorizedNetworkMember = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value + '/member/' + chooseMemberId.value,
    method: 'post',
    data: {
      authorized: true,
      // noAutoAssignIps: true,
      // activeBridge: true,
      // ipAssignments:ipAssignments.value.split(',')
    }
  }).then(res => {
    console.log(res.data)
  })
};
const updateNetworkMember = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value + '/member/' + chooseMemberId.value,
    method: 'post',
    data: {
      authorized: true,
      // noAutoAssignIps: true,
      // activeBridge: true,
      ipAssignments: ipAssignments.value.split(',')
    }
  }).then(res => {
    console.log(res.data)
  })
};

const deleteNetworkMember = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value + '/member/' + chooseMemberId.value,
    method: 'delete'
  }).then(res => {
    console.log(res.data)
  })
};

const getNetworkList = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network',
    method: 'get'
  }).then(res => {
    console.log(res.data)
    networkList.value = res.data
  })
};

const chooseMember = (m: string) => {
  chooseMemberId.value = m
}
const chooseNetwork = (n: string) => {
  chooseNetworkId.value = n
}
const joinNetwork = () => {
  window.nodeAPI.requestApi({
    url: 'network/' + chooseNetworkId.value,
    method: 'post',
    data: {
      "allowManaged": true,
      "allowDNS": false,
      "allowDefault": false,
      "allowGlobal": false
    }
  }).then(res => {
    console.log(res.data)
  })
}
const updateNetwork = () => {
  window.nodeAPI.requestApi({
    url: 'network/' + chooseNetworkId.value,
    method: 'post',
    data: {
      "allowManaged": true,
      "allowDNS": false,
      "allowDefault": false,
      "allowGlobal": false
    }
  }).then(res => {
    console.log(res.data)
  })
}

const getNetworkStatus = () => {
  window.nodeAPI.requestApi({
    url: 'controller/network/' + chooseNetworkId.value,
    method: 'get'
  }).then(res => {
    console.log(res.data)
  })
}
const joinNetworkDetail = () => {
  window.nodeAPI.requestApi({
    url: 'network/' + chooseNetworkId.value,
    method: 'get'
  }).then(res => {
    console.log(res.data)
  })
}
const leaveNetwork = () => {
  window.nodeAPI.requestApi({
    url: 'network/' + chooseNetworkId.value,
    method: 'delete'
  }).then(res => {
    console.log(res.data)
  })
}
let joinedNetworkList: Ref<any[]> = ref([])
const getjoinedNetworkList = () => {
  window.nodeAPI.requestApi({
    url: 'network',
    method: 'get'
  }).then(res => {
    console.log(res.data)
    joinedNetworkList.value = res.data
  })
}

let localJsonData: Ref<any[]> = ref([])
const getlocalJsonData = () => {
  window.nodeAPI.requestApi({
    url: 'unstable/controller/network',
    method: 'get'
  }).then(res => {
    console.log(res.data)
    localJsonData.value = res.data
  })
}
let peerList: Ref<any[]> = ref([])
let peerId = ref('')
const getPeerList = () => {
  window.nodeAPI.requestApi({
    url: 'peer',
    method: 'get'
  }).then(res => {
    console.log(res.data)
    peerList.value = res.data
  })
}

</script>

<template>
  <div>
    <div class="button" @click="getToken">获取token</div>
    <div class="button" @click="getStatus">连接到zerotier状态</div>
    <div> ---Controller 控制--- </div>
    <div class="button">
      <span @click="postNetwork">生成随机网络ID</span> <span>{{ newNetwork.id }}</span>
    </div>
    <div class="button">
      <span @click="getNetworkList">获取网络列表</span>
      <div v-for="n in networkList" @click="chooseNetwork(n)">{{ n }}</div>
    </div>
    <div class="button" >
      <span @click="getNetworkStatus">获取网络详情 网络ID:</span> <input v-model="chooseNetworkId" />
    </div>
    <div class="button">
      <span @click="postNetworkId">更新网络</span> <input v-model="chooseNetworkId" />
    </div>
    <div class="button">
      <span @click="deleteNetwork">删除网络</span> <input v-model="chooseNetworkId" />
    </div>
    <div class="button">
      <span @click="getNetworkMember">获取网络成员 网络ID:</span> <input v-model="chooseNetworkId" />
      <div v-for="(m, key) in networkMemberList" @click="chooseMember(key)">{{ key }}</div>
    </div>
    <div class="button">
      <span @click="getNetworkMemberDetail">网络成员详情 成员ID:</span> <input v-model="chooseMemberId" />
    </div>
    <div class="button">
      <span @click="authorizedNetworkMember">授权网络成员 成员ID:</span> <input v-model="chooseMemberId" />
    </div>
    <div class="button">
      <span @click="updateNetworkMember">更新网络成员设置 成员ID:</span> <input v-model="chooseMemberId" />
    </div>
    <div class="button">
      <span>授权的IP IP:</span> <input v-model="ipAssignments" />
    </div>
    <div class="button">
      <span @click="deleteNetworkMember">删除网络成员 成员ID:</span> <input v-model="chooseMemberId" />
    </div>
    <div> ---Joined Networks 加入网络--- </div>
    <div class="button">
      <span @click="getjoinedNetworkList">获取加入的网络列表</span>
      <div v-for="n in joinedNetworkList" @click="chooseNetwork(n.id)">{{ n.id }}</div>
    </div>
    <div class="button">
      <span @click="joinNetwork">加入网络 网络ID:</span> <input v-model="chooseNetworkId" />
    </div>
    <div class="button">
      <span @click="updateNetwork">更新网络设置 网络ID:</span> <input v-model="chooseNetworkId" />
    </div>
    <div class="button">
      <span @click="joinNetworkDetail">加入网络的详情 网络ID:</span> <input v-model="chooseNetworkId" />
    </div>
    <div class="button">
      <span @click="leaveNetwork">离开网络 网络ID:</span> <input v-model="chooseNetworkId" />
    </div>

    <div class="button">
      <span @click="getlocalJsonData">列出所有网络</span>
      <div v-for="n in localJsonData" @click="chooseNetwork(n.id)">{{ n.id }}</div>
    </div>

    <div class="button">
      <span @click="getPeerList">列出所有对等点</span>
      <div v-for="n in peerList" @click="chooseNetwork(n.id)">{{ n.id }}</div>
    </div>
    <div class="button">
      <span @click="joinNetwork">加入对等点 ID:</span> <input v-model="peerId" />
    </div>
  </div>
</template>

<style scoped>
.button {
  cursor: pointer;
}
</style>
