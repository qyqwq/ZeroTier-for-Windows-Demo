<script setup lang="ts">
import JoinPage from './components/JoinPage.vue'
import Message from './components/Message.vue'
import { messageApi } from './components/Message.vue'
import Modal from './components/Modal.vue'
import { ModalApi } from './components/Modal.vue'
import APIList from './components/APIList.vue'
import missionBus from '@/utils/missionBus'
const { missionNoEmpty, missionQuery } = missionBus
window.$message = messageApi
window.$modal = ModalApi
const tablist = {
  0: '加入网络',
  1: '创建网络',
  2: '中转设置'
}
const tabSelected: Ref<number> = ref(0);
// onMounted(() => {
//   console.log('onMounted')
//   window.$message = messageApi
//   window.$modal = ModalApi
// })
// onUpdated(()=>{
//   console.log('onUpdate')
//   window.$message = messageApi
//   window.$modal = ModalApi
// })
// onActivated(()=>{
//   console.log('onActivated')

// })
</script>

<template>
  <div class="main">
    <div class="title">
      <div class="icon-lable">
        <img class="icon" src="/ZeroTier.png" />
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
        <img src="/please.png" />
      </div>
      <div class="right">
        <JoinPage v-show="tabSelected == 0" />
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
                  <img v-show="!index" :src="fl.icon" />
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

    img {
      width: 2.5rem;
      border-radius: 10px;
      cursor: pointer;
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
