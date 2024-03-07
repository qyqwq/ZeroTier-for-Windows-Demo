<template>
  <Teleport to="#app">
    <div v-if="show" ref="el" :style="style" class="mouse-menu">
      <div v-for="m in menuList" @click="menuClick(m)" class="menu-item">
        {{ m.label }}
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
// let show, msg;
let promiseStack: Record<string, Function>[] = []
let defaultOpen: (option: MouseOption) => void = (option: MouseOption) => { }

//指令
type MouseOption = {
  x?: number;
  y?: number;
  menuList: () => any[];
}
let contextMenuEvent: (e: MouseEvent) => void;
export const vMouseMenuDirective = {
  mounted: (el: HTMLElement, { value }: { value: () => any[] }) => {
    contextMenuEvent = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault();
      const { x, y } = e;
      defaultOpen({
        menuList: value,
        x, y
      })
    };
    el.removeEventListener('contextmenu', contextMenuEvent);
    el.addEventListener('contextmenu', contextMenuEvent);
    // console.log('鼠标添加事件')
  },
  unmounted: (el: HTMLElement) => {
    el.removeEventListener('contextmenu', contextMenuEvent);
  }
}

export default {
  setup() {
    const show = ref(false)
    const dommsg = ref('')
    const el: Ref<HTMLElement | null> = ref(null)
    const posX = ref(0)
    const posY = ref(0)
    const transform = ref('')
    const menuList: Ref<any[]> = ref([])
    const style = computed(() => {
      return {
        left: posX.value + 'px',
        top: posY.value + 'px',
        transform: transform.value
      }
    })
    const menuClick = (m: any) => {
      m.callback()
      close('confirm')
    }
    //关闭弹窗
    const appClickCount = inject('appClickCount') as Ref<number>
    watch(appClickCount, () => {
      close('cancel')
    })
    const close = (type: string | Event) => {
      let lastPromise = promiseStack.pop()
      if (lastPromise) {
        if (type == 'confirm') {
          lastPromise.resolve && lastPromise.resolve('confirm')
        } else {
          lastPromise.reject && lastPromise.reject('cancel')
        }
      }
      show.value = false
    }
    //设置触发函数
    onMounted(() => {
      defaultOpen = (option: MouseOption) => {
        posX.value = option.x || 0
        posY.value = option.y || 0
        menuList.value = option.menuList()
        nextTick(() => {
          //算一下右侧距离
          // console.log(el)
          if (el.value !== null) {
            let { clientHeight, offsetLeft, offsetTop, clientWidth } = (el.value as HTMLElement)
            let rightWidth = clientWidth + offsetLeft
            let bottomHeight = clientHeight + offsetTop
            let { innerWidth, innerHeight } = window
            let tx = '5px', ty = '5px';
            //超右边
            if (rightWidth >= innerWidth - 16) {
              tx = 'calc(-100% - 5px)'
            }
            //超下面
            if (bottomHeight >= innerHeight - 16) {
              ty = 'calc(-100% + 5px)'
            }
            transform.value = `translate(${tx},${ty})`
          }
          nextTick(() => {
            show.value = true
          })
        })
        // console.log('右键弹窗', option, option.x, option.y)
        // dommsg.value = msg
      }
    })

    return {
      show, dommsg, close, style, menuList, menuClick, el
    }
  },
}
</script>

<style lang="less" scoped>
.mouse-menu {
  position: fixed;
  background: #4f4f4f82;
  padding: .5rem;
  z-index: 80;
  color: white;
  // left: 157px;
  // top: 466px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  min-width: 8rem;
  // transform: translate(5px,5px);

  .menu-item {
    font-size: .9rem;
    border-radius: 10px;
    padding: .4rem;
    cursor: pointer;
    text-wrap: nowrap;

    &:hover {
      background: #6f6f6f8f;
    }

    &+.menu-item {
      margin-top: .4rem;
    }
  }
}
</style>