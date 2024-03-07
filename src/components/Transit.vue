<script setup lang="ts">
import { sendlog } from "@/utils/log";
import missionBus from "@/utils/missionBus";
let {
  getPeerList,
  peerList,
  localJsonData
} = missionBus

const icons = inject('icons') as Record<string, string>
const serveId = ref('')
const addTransit = () => {
  window.nodeAPI.addTransit(serveId.value).then((res: any) => {
    if (res.status == 'success') {
      window.$message('添加服务器成功')
      getPeerList()
    } else {
      window.$message('添加服务器失败')
    }
  })
}
let initCount = 0
onActivated(() => {
  sendlog.log('中转页面显示初始化', ++initCount)
  getPeerList()
})
const tabNum = ref(0)
const isLeaf = computed(() => tabNum.value == 0)
const isMoon = computed(() => tabNum.value == 1)
const isPlanet = computed(() => tabNum.value == 2)
const nameMap = computed(() => {
  let map = {}
  localJsonData?.joinedNetworkList?.forEach(net => {
    net?.memberList?.forEach(member => {
      map[member.id] = member.name
    })
  });
  console.log('nameMap', nameMap)
  return map
})
const pathPrint = (arr) => arr.map(e => ({
  ...e,
  showPath: e.paths && e.paths[0] && e.paths[0].address || '',
  name: nameMap.value[e.address] || ''
}))
const peerLeaf = computed(() => nameMap && pathPrint(peerList.value.filter(e => e.role == 'LEAF')) || [])
const peerMoon = computed(() => nameMap && pathPrint(peerList.value.filter(e => e.role == 'MOON')) || [])
const peerPlanet = computed(() => nameMap && pathPrint(peerList.value.filter(e => e.role == 'PLANET')) || [])

const showList = computed(() => {
  return {
    0: peerLeaf.value,
    1: peerMoon.value,
    2: peerPlanet.value,
  }[tabNum.value]
  // return peerList.value.concat(peerList.value)
})
const refresh = () => {
  getPeerList()
  window.$message('刷新')
}
</script>

<template>
  <div class="transit">
    <div class="title">
      <div>
        ID:
      </div>
      <div>
        <input class="input" v-model="serveId" />
      </div>
      <div class="add" @click="addTransit">
        添加中转
      </div>
    </div>
    <div class="transit-body">
      <!-- <div class="transit-body-title">节点列表</div> -->
      <div class="tablist">
        <div class="tablist-item" :class="{ 'active': isLeaf }" @click="tabNum = 0">
          <span>网络成员</span>
          <Transition name="fade">
            <div v-show="isLeaf" class="arrow"></div>
          </Transition>
        </div>
        <div class="tablist-item" :class="{ 'active': isMoon }" @click="tabNum = 1">
          <span>中转服务器</span>
          <Transition name="fade">
            <div v-show="isMoon" class="arrow"></div>
          </Transition>
        </div>
        <div class="tablist-item" :class="{ 'active': isPlanet }" @click="tabNum = 2">
          <span>官方根服务器</span>
          <Transition name="fade">
            <div v-show="isPlanet" class="arrow"></div>
          </Transition>
        </div>
        <img class="refresh" :src="icons.refresh" @click="refresh" />
      </div>
      <div class="grid-body">
        <div class="grid">
          <div>ID</div>
          <div>昵称</div>
          <div>延迟</div>
          <div>IP路径</div>
        </div>
        <div class="scroll">
          <div class="grid" v-for="peer in showList">
            <div>{{ peer.address }}</div>
            <div class="name">{{ peer.name || '-' }}</div>
            <div>{{ peer.latency || '-' }}</div>
            <div>{{ peer.showPath || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.transit {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding: 0 1rem;

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 4rem;
    font-size: 1.1rem;

    .input {
      background-color: transparent;
      border: none;
      width: 12rem;
      caret-color: white;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
      border-bottom: 1px solid;
      margin: 1rem;

      &:focus-visible {
        outline: none;
      }
    }

    .add {
      cursor: pointer;

      &:hover {
        color: #FDB25D;
      }
    }
  }

  .transit-body {
    height: 10rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .transit-body-title {
      font-size: .9rem;
      color: #adadad;
    }

    .tablist {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.5rem 0 0;
      /* box-shadow: 0 2px 1px 1px white; */
      color: #dfdfdf;
      padding: 0 0 1rem;

      .tablist-item {
        cursor: pointer;
        position: relative;
        padding: .2rem .5rem;
        transition: .3s;

        &+.tablist-item {
          margin: 0 0 0 1rem;
        }

        &:hover,
        &.active {
          color: #FDB25D;
          transition: .3s;
        }

        &.active {
          border-bottom: 1px solid;
        }
      }

      .arrow:before {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        width: 0;
        height: 0;
        border-width: 6px;
        border-style: solid;
        border-color: #FDB25D transparent transparent transparent;
        transform: translate(-50%, 5px);
        z-index: 10;
      }
    }
    .refresh{
      cursor: pointer;
    }

    .grid-body {
      background-color: #333333;
      padding: 1rem;
      border-radius: 10px;
      user-select: text;
      margin: 0 0 1rem;
      // flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .scroll {
      overflow-y: scroll;
      overflow-x: hidden;
      flex-grow: 1;
      // height: 0;
      max-height: calc(100vh - 19rem);
    }

    .grid {
      display: grid;
      grid-template-rows: 2rem;
      grid-template-columns: 8rem 8rem 6rem 10rem;

      .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>