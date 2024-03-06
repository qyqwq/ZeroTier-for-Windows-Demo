/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface IElectronAPI {
  readZerotierToken: () => Promise<Promise.resolve>;
  requestApi: (option: AxiosRequestOption) => Promise<apiresult>;
  installZero: () => Promise<Boolean>;
  readData: () => Promise<any>;
  starteZero: () => Promise<any>;
  writeData: (Object) => Promise<any>;
  requestMember: ({ }) => Promise<any>;
  onWebContentsSend: (data: any) => void;
}
type apiresult = { code: number; status: string, data: any };

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer;
  nodeAPI: IElectronAPI;
  $message: (option: string | Object) => void;
  $modal: (option: string | Object) => Promise<any>;
}
interface missionObject {
  key?: Number; //标记任务id
  icon?: string; //任务图标路径
  name?: String; //任务名称
  fn: () => Promise<any>; //任务函数
  callback?: function; //回调函数
  finish?: Boolean;
}


interface localJsonDataType {
  [key: string]: any;
  nickname?: string; //昵称
  joinedNetworkList?: userNetwork[]; //加入过的网络列表

}
interface userNetwork {
  allowDNS?: Boolean;
  allowDefault?: Boolean;
  allowManaged?: Boolean;
  allowGlobal?: Boolean;
  id?: string;
  name?: string;
  assignedAddresses?: string[];
  type?: string;
  status?: string;
  Authorization?: string;
  memberList?: netMember[];
  adminIds?: any[];//管理员id列表
}
interface netMember{
  id?: string;
  authorized?: Boolean;
  lastSeen?: Number;
  nodeId?: string;
  networkId?: string;
  name?: string;
  ip?: string;
}