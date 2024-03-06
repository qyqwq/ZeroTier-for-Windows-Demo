<script setup lang="ts">
const { show, title } = defineProps(['show', 'title'])
defineEmits(['update:show', 'confirm'])
// watch(show, (v) => {
//   console.log(v)
// })
</script>
<template>
  <Teleport to="#app">
    <div>
      <Transition name="mark" appear>
        <div v-show="show" @click="$emit('update:show', false)" class="mark"></div>
      </Transition>
      <Transition name="dialog" appear>
        <div v-show="show" class="dialog">
          <div class="title">
            <div>{{ title }}</div>
            <img @click="$emit('update:show', false)" class="close" title="关闭" src="@/assets/delete.svg" />
          </div>
          <slot></slot>
          <div class="btns">
            <div @click="$emit('update:show',false)" class="btn">取消</div>
            <div @click="$emit('confirm',$event)" class="btn confirm">确认</div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
<style scoped lang="less">
.dialog {
  position: absolute;
  background: #35373D;
  color: white;
  font-weight: bold;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  min-width: 18rem;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  // min-height: 3rem;
  box-shadow: 1px 1px 2px 0px #161616;
  z-index: 100;
  opacity: 1;
  transition: 300ms cubic-bezier(0.325, 1.470, 0.745, 1.145);
}

.mark {
  position: absolute;
  background: #00000075;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 90;
  opacity: 1;
  transition: opacity .3s ease;
}

.title {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 1rem;

  .close {
    cursor: pointer;
    // position: absolute;
    // right: 1rem;
    // top: .8rem;
  }
}

.btns {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem 0 0;
  font-size: .9rem;
  user-select: none;

  .btn {
    margin: 0 0 0 .5rem;
    cursor: pointer;
    padding: .4rem 1.3rem;
    border-radius: 10px;
    color: #9d9d9d;

    &.confirm {
      background-color: #FDB25D;
      color: white;

      &:hover {
        background-color: #FDB25D;
      }
    }

    &:hover {
      background-color: #4C4E50;
    }
  }
}

.dialog-enter-active {
  transform: translate(-50%, -50%) scale(0);
}

.dialog-enter-from.dialog-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%);
}

.dialog-leave-active {
  transform: translate(-50%, -50%) scale(0);
  transition: 300ms ease;
}

.mark-enter-active,
.mark-leave-active {
  opacity: 0;
  // transition: opacity .3s ease;
}

.mark-enter-from.mark-leave-to {
  opacity: 0;
}

.mark-enter-to.mark-leave-from {
  opacity: 1;
}</style>