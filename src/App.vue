<script setup lang="ts">
import JoinPage from './components/JoinPage.vue'
import Transit from './components/Transit.vue'
import Download from './components/Download.vue'
import CreateNet from './components/CreateNet.vue'
import Message from './components/Message.vue'
import { messageApi } from './components/Message.vue'
import Modal from './components/Modal.vue'
import { ModalApi } from './components/Modal.vue'
import MouseMenu from './components/MouseMenu.vue'
import APIList from './components/APIList.vue'
import missionBus from '@/utils/missionBus'
import { sendlog } from '@/utils/log';
import icons from '@/utils/icons'
provide('sendlog', sendlog)
provide('icons', icons)
const { missionNoEmpty, missionQuery, init } = missionBus
window.$message = messageApi
window.$modal = ModalApi
const tablist = {
  0: '加入网络',
  1: '创建网络',
  2: '中转设置',
}
let tabComponentMap: Record<number, any> = {
  0: JoinPage,
  1: CreateNet,
  2: Transit,
  // 3: Download
}
const tabComponent = computed(() => {
  return tabComponentMap[tabSelected.value]
})

const tabSelected: Ref<number> = ref(0)
const appClickCount: Ref<number> = ref(0)
provide('appClickCount', appClickCount)
const appClick = () => {
  // console.log('全局点击')
  appClickCount.value++
}
</script>

<template>
  <div class="main" @click="appClick">
    <div class="title">
      <div class="icon-lable">
        <img class="icon" :src="icons.ZeroTier" />
        <!-- <Transition name="fade"> -->
        <div v-show="missionNoEmpty" class="arrow"></div>
        <!-- </Transition> -->
      </div>
      <div></div>
      <div class="tablist">
        <div v-for="(name, key) in tablist" class="tab" :class="{ selected: tabSelected == key }"
          @click="tabSelected = key">{{ name }}</div>
      </div>
    </div>
    <div class="main-body">
      <div class="left">
        <div class="iconList">
          <!-- <img :src="icons.download" @click="tabSelected = 3" /> -->
          <img :src="icons.please" />
        </div>
      </div>
      <div class="right">
        <KeepAlive>
          <component :is="tabComponent" />
        </KeepAlive>
        <!-- <div @click="addmission()">添加</div> -->
        <!-- <div @click="missionStart">执行</div> -->
      </div>
      <!-- 流程图 -->
      <Transition name="fade">
        <div class="mission-list-body" v-show="missionNoEmpty">
          <template v-for="(fl, index) in missionQuery" :key="fl.key">
            <Transition name="mission-item">
              <div v-show="!fl.finish" class="mission-list-item">
                <Transition name="fade">
                  <img v-show="!index" :src="icons[fl.icon as string]" />
                </Transition>
                <div class="name">{{ fl.name }}</div>
                <!-- <div class="allow"></div> -->
              </div>
            </Transition>
          </template>
        </div>
      </Transition>
    </div>
    <!-- <APIList class="api-list" /> -->
    <Message />
    <Modal />
    <MouseMenu />
  </div>
</template>

<style lang="less" scoped>
.main {
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;

}

.title {
  // height: 6.4em;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #1E1F22;
  -webkit-app-region: drag;

  .icon-lable {
    width: 4rem;
    text-align: center;
    height: 2.5rem;
    position: relative;

    .arrow:before {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      width: 0;
      height: 0;
      border-width: 8px;
      border-style: solid;
      border-color: #c1c1c1 transparent transparent transparent;
      transform: translate(-50%, 17px);
      z-index: 10;
    }

    .icon {
      border-radius: 10px;
      height: 2.5rem;
      width: 2.5rem;
    }
  }

  .tablist {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 4rem;
    height: 100%;
    // border-left: 1px solid #676767;

    .tab {
      cursor: pointer;
      margin: 0 1rem;
      -webkit-app-region: none;

      &:hover,
      &.selected {
        color: #FFA500;
      }
    }

  }
}

.main-body {
  flex-grow: 1;
  position: relative;
  overflow: auto;
  background: #1E1F22;
  // border-top: 1px solid #676767;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  display: flex;

  .left {
    width: 4rem;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 0 1rem;

    .iconList {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    img {
      width: 2.5rem;
      border-radius: 10px;
      cursor: pointer;

      // background-color: #676767;
      &+img {
        margin: 1rem 0 0;
      }
    }
  }

  .right {
    flex-grow: 1;
    padding: 1rem;
    border-radius: 1.5rem 1.5rem 0 1.5rem;
    background: #25272A;
  }
}

.mission-list-body {
  width: 4rem;
  // background: #35373D;
  border-top: 1px solid #676767;
  color: white;
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-radius: 0 0 10px 10px;
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem 0;
  font-size: 0.9rem;
  color: #d9d9d9;
  z-index: 5;

  // & * {
  //   transition: .3s;
  // }

  .mission-list-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 0.4rem 0;
  }

}

.mission-item-enter-active {
  transition: 0.5s ease;
}

.mission-item-leave-active {
  animation: mission-item-leave 0.5s;
}

.mission-item-leave-to {
  opacity: 0;
}

.mission-item-enter-from {
  opacity: 0;
}

@keyframes mission-item-leave {
  0% {
    opacity: 1;
  }

  60% {
    opacity: 0;
    height: auto;
  }

  100% {
    opacity: 0;
    height: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
