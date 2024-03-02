<script setup lang="ts">
import missionBus from '@/utils/missionBus'
import { useRequest } from 'vue-request';
import checkbox from './checkbox.vue';
import Dialog from './Dialog.vue';
const {
	joinNetwork,
	localJsonData,
	updateLocalJsonData,
	zerotierStatus,
	closeNetwork,
	updateLoaclNetwork
} = missionBus

//更新昵称
const updateNickname = () => updateLocalJsonData()
//网络列表 展示用的
const joinedNetworkList: Ref<userNetwork[]> = computed(() => {
	//本地网络列表缓存
	if (Array.isArray(localJsonData.joinedNetworkList)) {
		return localJsonData.joinedNetworkList
	} else {
		return []
	}
})
//添加网络
const joinNetworkId = ref('')
let settingBox: Ref<userNetwork> = ref({
	allowManaged: true,
	allowGlobal: false,
	allowDefault: false,
	allowDNS: false,
})
watch(settingBox, (v) => {
	// console.log(v)
}, {
	deep: true
})
//触发更新
const settingBoxUpdate = () => joinNetworkUpdate()
const joinNetworkDialogShow = ref(false)
const joinNetworkDialog = () => {
	joinNetworkDialogShow.value = true
}
//从弹窗id加入网络
const joinNetworkConfirm = () => {
	joinNetworkDialogShow.value = false
	joinNetwork(joinNetworkId.value, {
		allowManaged: true,
		allowGlobal: false,
		allowDefault: false,
		allowDNS: false,
	}).finally(() => {
		joinNetworkId.value = ''
	})
}
//加入 & 更新网络
const joinNetworkUpdate = (net?: userNetwork) => {
	let settintObj = {}
	let netId = ''
	//从列表双击
	if (net) {
		let { id, allowManaged, allowGlobal, allowDefault, allowDNS } = net
		netId = id || ''
		Object.assign(settintObj, { allowManaged, allowGlobal, allowDefault, allowDNS })
	} else {
		netId = selectedNetworkId.value
		let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
		//从现有列表连接
		if (netIndex >= 0) {
			let { allowManaged, allowGlobal, allowDefault, allowDNS } = joinedNetworkList.value[netIndex]
			Object.assign(settintObj, { allowManaged, allowGlobal, allowDefault, allowDNS })
		} else {
			//从详情中连接
			settintObj = JSON.parse(JSON.stringify(settingBox.value))
		}
	}

	joinNetwork(netId, settintObj).then((res: any) => {
		//选中,更新
		selectNetwork(res.data)

		let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
		selectedNetworkCopy.value = joinedNetworkList.value[netIndex]
	})
}
//离开网络
const leaveNetwork = () => {
	window.$modal('离开网络').then(res => {
		//离开
		let netId = selectedNetworkId.value
		closeNetwork(netId).then(res => {
			// console.log()
			let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
			if (netIndex >= 0) {
				joinedNetworkList.value[netIndex]['status'] = 'undefined'
				updateLocalJsonData()
				selectedNetworkCopy.value = joinedNetworkList.value[netIndex]
			}
			// selectedNetworkId.value = ''
		})
	})
}

//选中的网络
const selectedNetworkId = ref('')
let selectedNetworkCopy: Ref<userNetwork> = ref({});
const selectNetwork = (net: userNetwork) => {
	selectedNetworkId.value = net.id || ''
	selectedNetworkCopy.value = net
	settingBox.value.allowManaged = net.allowManaged
	settingBox.value.allowGlobal = net.allowGlobal
	settingBox.value.allowDefault = net.allowDefault
	settingBox.value.allowDNS = net.allowDNS
	// console.log(net)
	// console.log(settingBox)
}

//网络详情
const myip = computed(() => {
	let arr = selectedNetworkCopy.value.assignedAddresses
	if (Array.isArray(arr)) {
		return arr.join(',') || '未分配IP'
	} else {
		return '未分配IP'
	}
})
//状态显示
let statusMap: Record<string, string[]> = {
	'REQUESTING_CONFIGURATION': ['等待授权', '#1296db', 'wait'],
	"ACCESS_DENIED": ['等待授权', '#1296db', 'wait'],
	'undefined': ['未连接', '#8A8A8A', 'closed']
}
const myStatus = computed(() => {
	let status = selectedNetworkCopy.value.status
	// if (status) {
	let [name, color, icon] = statusMap[String(status)]
	return { name, color, icon }
	// } else {
	// 	return {
	// 		name: '未连接',
	// 		color: '#8A8A8A',
	// 		icon:'closed'
	// 	}
	// }
})
//列表状态显示
const listStatus = (status: string | undefined) => {
	let [name, color, icon] = statusMap[String(status)]
	return icon
}

//点击复制
const copyText = (text: string | number | undefined) => {
	if (text) {
		navigator.clipboard.writeText(text.toString());
		window.$message('已复制  ' + text)
	}
}
</script>
<template>
	<div class="join-page">
		<!-- 网络列表 -->
		<div class="left">
			<div class="info">
				<div class="info-item" style="color: #FDB25D;">
					本机信息
				</div>
				<div class="info-item">
					<div>ID</div>
					<div style="font-size: 1.05rem;cursor: pointer;">
						<span>{{ zerotierStatus.address }}</span>
						<!-- <img src="/copy.svg" /> -->
					</div>
				</div>
				<div class="info-item">
					<div>昵称</div>
					<input v-model="localJsonData.nickname" @blur="updateNickname" placeholder="name" class="nickname-input" />
				</div>
			</div>
			<div class="list-title">
				<div>网络列表</div>
				<div class="icons"><img @click="joinNetworkDialog" title="添加" src="/add.svg" /></div>
			</div>
			<div class="list">
				<div v-for="net in joinedNetworkList" class="list-item" @click="selectNetwork(net)"
					@dblclick="joinNetworkUpdate(net)">
					<img style="transform: translateY(1px);" src="/vlan.svg" />
					<span class="text">{{ net.name || net.id }}</span>
					<img v-show="listStatus(net.status) == 'pass'" class="pass" src="/pass.svg" />
					<img v-show="listStatus(net.status) == 'wait'" class="pass" src="/wait.svg" />
					<img class="delete" @click.stop title="删除" src="/delete.svg" />
				</div>
			</div>
		</div>
		<div class="right">
			<template v-if="selectedNetworkId">
				<div class="top">
					<div class="info">
						<span class="name" :title="selectedNetworkCopy.name || ''">{{ selectedNetworkCopy.name || '未知网络名' }}</span>
						<span>ID <span class="underline" @click="copyText(selectedNetworkCopy.id)">{{ selectedNetworkCopy.id
						}}</span></span>
						<span>IP <span class="underline" @click="copyText(myip)">{{ myip }}</span></span>
						<span :style="{ color: myStatus.color }">{{ myStatus.name }}</span>
					</div>
					<div class="setting">
						<div class="button">
							<div class="setting-item">
								<checkbox v-model:value="settingBox.allowManaged" @update:value="settingBoxUpdate"
									keyname="allowManaged" />
								<span class="text">启用连接</span>
							</div>
							<div class="setting-item">
								<checkbox v-model:value="settingBox.allowGlobal" @update:value="settingBoxUpdate" keyname="allowGlobal" />
								<span class="text">全局连接</span>
							</div>
						</div>
						<div v-show="myStatus.icon != 'colsed'" class="close">
							<span @click="joinNetworkUpdate()" class="link">连接</span>
							<span @click="leaveNetwork" class="leave">断开连接</span>
						</div>
					</div>
				</div>
				<div class="right-body">
					<div class="member">
						<div class="member-title">网络成员</div>
						<div class="member-grid">
							<div v-for="i in 5" class="member-item">
								<img class="icon" src="/user.svg" />
								<div class="name">昵称</div>
							</div>
						</div>
					</div>
				</div>
			</template>
			<div v-else class="empty-body">
				<img class="icon" src="/ZeroTier.png" />
				<div class="empty-button" @click="joinNetworkDialog">
					添加网络
				</div>
			</div>
		</div>
		<!-- 加入网络设置 -->
		<!-- allowManaged 允许托管。默认是。允许 ZeroTier 设置 IP 地址和路由（仅限本地/专用范围）
			allowGlobal 允许全局。默认否。允许 ZeroTier 设置全局/公共/非私有范围 IP 和路由。
			allowDefault 允许默认。默认否。允许 ZeroTier 设置系统上的默认路由。请参阅完整隧道模式。
			allowDNS 允许 DNS。默认否。允许 ZeroTier 设置 DNS 服务器。-->
		<Dialog v-model:show="joinNetworkDialogShow" title="网络ID" @confirm="joinNetworkConfirm">
			<div class="net-id-input">
				<!-- <div>网络ID</div> -->
				<input v-model="joinNetworkId" class="input">
			</div>
		</Dialog>

	</div>
</template>
<style lang="less" scoped>
.join-page {
	@title-size: 1.1rem;
	@padding-top: 1rem;

	height: 100%;
	display: flex;

	.left {
		width: 12rem;
		border-right: 1px solid #323437;
		display: flex;
		overflow: auto;
		flex-direction: column;
		padding: 0 1rem 0 0;

		.info {
			margin: @padding-top 0 1.5rem;
			font-size: @title-size;
			border-bottom: 1px solid #484849;
		}

		.info-item {
			display: flex;
			justify-content: space-between;
			margin: 0 0 .5rem;

			.nickname-input {
				background-color: transparent;
				border: none;
				width: 8rem;
				caret-color: white;
				text-align: right;
				color: white;
				font-weight: bold;
				font-size: @title-size;

				&:focus-visible {
					outline: none;
				}
			}
		}

		.list-title {
			margin: 0 0 0.5rem 0;
			color: #FDB25D;
			font-size: @title-size;
			display: flex;

			.icons {
				height: auto;
				display: flex;
				align-items: center;
				padding-left: 1rem;

				img {
					width: 1.2rem;
					cursor: pointer;
				}
			}
		}

		.list {
			overflow-y: scroll;
			overflow-x: hidden;
			flex-grow: 1;
			height: 10rem;

		}

		.list-item {
			font-size: 0.8rem;
			margin: 0.2rem 0;
			padding: 0.6rem 0 0.6rem 0.4rem;
			cursor: pointer;
			display: flex;
			align-items: center;
			border-radius: 10px;

			&:hover {
				background-color: #323437;

				.pass {
					display: none;
				}

				.delete {
					display: block;
				}
			}

			.pass {
				display: block;
			}

			.delete {
				display: none;
			}

			.text {
				margin: 0 1rem 0 0.4rem;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	.right {
		padding: 0 @padding-top ;
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		.title {
			font-size: 1.1rem;
			color: #FDB25D;
		}

		.top {
			background-color: #36383D;
			border-radius: 10px;
			padding: 1rem;

			.setting {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin: 1rem 0 0;

				.button {
					display: flex;
					align-items: center;
				}

				.setting-item {
					display: flex;
					align-items: center;
					border-radius: 10px;
					font-size: 0.9rem;
					margin: 0 1rem 0 0;

					.text {
						margin: 0 0 0 .3rem;
						color: #dddddd;
					}
				}

				.close {
					color: #ff7973;
					font-size: .9rem;
					.link {
						cursor: pointer;
						color: #FDB25D;
						margin: 0 1rem 0 0;
					}
					.leave{
						cursor: pointer;
					}
				}
			}
		}

		.info {
			display: flex;
			align-items: baseline;
			font-size: .9rem;

			& * {
				flex-grow: 1;
			}

			.name {
				font-size: 1.2rem;
				color: #FDB25D;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 25%;
			}
		}

		.underline {
			text-decoration: underline dotted;
			cursor: pointer;
		}

		.right-body {
			flex-grow: 1;
			display: flex;
			padding: 1rem;

			.member {
				flex-grow: 1;
				display: flex;
				flex-direction: column;

				.member-title {
					font-size: .9rem;
				}

				.member-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, 9rem);
					grid-template-rows: repeat(auto-fill, 2rem);
					gap: 1rem;
					flex-grow: 1;
					height: 10rem;
					overflow-y: scroll;
					overflow-x: hidden;
					padding: 1rem 0;

					.member-item {
						display: flex;
						align-items: center;
						font-weight: 500;
						color: #DAEAD0;
						cursor: pointer;
						padding: 0 0 0 .5rem;
						border-radius: 20px;
						font-size: 1rem;
						transition: border .3s;
						border: 1px solid transparent;

						&:hover {
							border: 1px solid #88910c;

						}

						.icon {
							width: 1.2rem;
							margin: 0 .5rem 0 0;
						}

						.name {
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}
				}
			}
		}

		.empty-body {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			flex-grow: 1;
			font-size: 1.4rem;
			color: white;
			transform: translateY(-4rem);

			.icon {
				border-radius: 20px;
				width: 5rem;
				margin: 0 0 1rem;
			}

			.empty-button {
				&:hover {
					color: #FDB25D;
					cursor: pointer;
				}
			}
		}
	}

}

.net-id-input {

	/* display: flex; */
	// align-items: baseline;
	// padding: 0 1rem;
	/* height: 2rem; */
	/* font-size: 1.1rem; */
	.text {
		font-size: .9rem;
		color: #c5c5c5;
		margin: 0 0 .3rem;
	}

	.input {
		background-color: transparent;
		border: none;
		/* width: 8rem; */
		caret-color: white;
		/* text-align: right; */
		color: white;
		font-weight: bold;
		/* flex-grow: 1; */
		border: 1px solid #909090;
		font-size: 1.1rem;
		border-radius: 10px;
		padding: .5rem 1rem;
		width: calc(calc(100% - 2rem) - 2px);
		transition: box-shadow .3s;

		&:focus-visible {
			outline: none;
			box-shadow: 0 0 0px 2px #FDB25D;
		}

		&:hover {
			border: 1px solid #FDB25D;
		}
	}
}
</style>