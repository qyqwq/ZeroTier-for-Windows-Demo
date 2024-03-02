<script setup lang="ts">

</script>
<template>
  <Transition>
    <div v-show="show" class="box">
      {{ msg || '消息框' }}
    </div>
  </Transition>
</template>
<script lang="ts">
// let show, msg;
let defaultOpen: (msg: string) => void
let timeout:NodeJS.Timeout
export const messageApi = (option: string | Object) => {
  if (typeof option === 'string') {
    // show = true
    // msg = option
    defaultOpen(option)
  }
}

export default {
  name: 'Message',
  data() {
    return {
      show: false,
      msg: '',
    }
  },
  mounted() {
    defaultOpen = this.open
  },
  methods: {
    open(msg: string) {
      this.show = true
      this.msg = msg
      if(timeout){
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        this.show = false
      }, 3000);
    }
  }
}
</script>
<style scoped lang="less">
.box {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  background-color: #494949;
  color: white;
  border-radius: 10px;
  padding: .2rem 2rem;
  font-size: .9rem;
  transition: .3s;
  transform: translateX(-50%);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>