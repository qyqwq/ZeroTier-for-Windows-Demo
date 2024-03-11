<script setup lang="ts">
import missionBus from "@/utils/missionBus";
let {
  uploadFileList,
  takeFileList,
  nameMap,
  showfileSize
} = missionBus
const icons = inject('icons') as Record<string, string>

const tabNum: Ref<'0' | '1'> = ref('0')
const isUpload = computed(() => tabNum.value == '0')
const isTake = computed(() => tabNum.value == '1')

const showList = computed(() => {
  return {
    0: uploadFileList.value,
    1: takeFileList.value,
  }[tabNum.value]
})
</script>

<template>
  <div class="transit">
    <div class="transit-body">
      <div class="tablist">
        <div class="tablist-item" :class="{ 'active': isUpload }" @click="tabNum = '0'">
          <span>我发送的文件</span>
          <Transition name="fade">
            <div v-show="isUpload" class="arrow"></div>
          </Transition>
        </div>
        <div class="tablist-item" :class="{ 'active': isTake }" @click="tabNum = '1'">
          <span>我接收的文件</span>
          <Transition name="fade">
            <div v-show="isTake" class="arrow"></div>
          </Transition>
        </div>
        <!-- <img class="refresh" :src="icons.refresh" @click="refresh" /> -->
      </div>
      <div class="grid-body">
        <div class="grid">
          <div>文件名称</div>
          <div>进度</div>
          <div>大小</div>
          <div v-show="isUpload">接收人</div>
          <div v-show="isTake">发送人</div>
          <div>状态</div>
        </div>
        <div class="scroll">
          <div class="grid" v-for="item in showList">
            <div class="name" :title="item.fileName">{{ item.fileName }}</div>
            <div>{{ '-' }}</div>
            <div>{{ showfileSize(item.size) }}</div>
            <div class="name">{{ nameMap[item.takeId] || item.takeId }}</div>
            <div>{{ '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div>
      <div>下载路径</div>
    </div>
    <div>
      <div>接收文件</div>
      <div>
        文件列表
      </div>
    </div> -->
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

    .refresh {
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
      grid-template-columns: 10rem 10rem 6rem 6rem 6rem;

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