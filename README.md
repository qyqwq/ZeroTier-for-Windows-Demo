# ZeroTier-for-Windows

Demo版 暂时只有简中

## 感谢
[![ZeroTier](https://avatars.githubusercontent.com/u/4173285?s=60&v=4)](https://github.com/zerotier/ZeroTierOne)
[![electron-vite-vue](https://github.com/electron-vite.png?size=60)](https://github.com/electron-vite/electron-vite-vue)
[![vue3](https://avatars.githubusercontent.com/u/6128107?s=70&v=4)](https://github.com/vuejs/core)
[![Koa](/public/Koa.png?v=2)](https://github.com/koajs/koa)

<!-- [![GitHub Build](https://github.com/electron-vite/electron-vite-vue/actions/workflows/build.yml/badge.svg)](https://github.com/electron-vite/electron-vite-vue/actions/workflows/build.yml)
[![GitHub Discord](https://img.shields.io/badge/chat-discord-blue?logo=discord)](https://discord.gg/sRqjYpEAUK) -->

## 预览

![Preview.mp4](/public/Preview.gif?t=1)

## 目前完成的功能

- 加入网络
  - 自动安装 ZeroTier One 核心
  - 网络成员自己设置备注
- 网络功能
  - 批量 Ping 成员
  - 查看成员 ID 与 IP
  - 默认连接 与 全局连接
- 网络管理 - 官方平台创建的网络
  - 设置管理 Token
  - 成员授权
  - 网络内成员信息同步
- 中转设置
  - 添加中转服务器
  - 查看 网络成员 与 中转服务 连接信息
- 语言支持
  - 简体中文
- 平台支持
  - Windows
## 计划添加的功能
- 网络功能
  - 成员文件共享
  - 设置开放的端口，可供成员一键访问本地项目
- 网络创建
  - 支持本地创建 官方平台的网络
  - 支持本地创建 个人终端上的网络
- 网络管理
  - 可删除/添加成员
  - 可管理 个人终端的网络
- 程序自动更新
  - 自动更新本程序
  - 自动更新 ZeroTier One 核心
- 语言支持
  - Engilsh
- 平台支持
  - MacOS
## 启动

```sh
# clone the project
git clone https://github.com/qyqwq/ZeroTier-for-Windows-Demo

# enter the project directory
cd ZeroTier-for-Windows-Demo

# install dependency
npm install

# develop
npm run dev

# build
npm run build
```
