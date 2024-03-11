<script setup lang="ts">
const icons = inject('icons') as Record<string, string>
const openBrowser = () => {
  window.nodeAPI.openBrowser('https://my.zerotier.com/')
}
</script>
<template>
  <div class="create-net">
    <div class="tab-item" @click="openBrowser">
      <div>在官方平台创建</div>
      <div class="info">
        <!-- <img :src="icons.chrome"  /> -->
        <div>
          <span class="green">管理员Token</span>
          获取:
        </div>
        <div>1.注册登录</div>
        <div>
          2.点击右上角
          <span class="green">Account</span>
        </div>
        <div>
          3.点击
          <span class="green">New Token</span>
        </div>
        <span class="red" style="margin: 3rem 0 0;">本机代理创建功能开发中</span>
      </div>
    </div>
    <div class="tab-item disable">
      <div>在本机创建</div>
      <div class="info red">开发中</div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.create-net {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;

  .tab-item {
    width: 35%;
    display: flex;
    align-items: center;
    height: 45vh;
    flex-direction: column;
    background-color: #333333;
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    transition: box-shadow .3s;
    &:hover{
      box-shadow: 1px 1px 5px 1px #71d8ffa6;
    }

    &.disable {
      cursor: not-allowed;

    }

    .info {
      flex-grow: 1;
      display: flex;
      // align-items: center;
      justify-content: center;
      flex-direction: column;
    }
  }

  .green {
    color: #19A974;
  }

  .red {
    color: red;
  }
}
</style>
