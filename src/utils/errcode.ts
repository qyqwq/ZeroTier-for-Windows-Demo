export const errcodeMatch: Record<string, number> = {
  'no such file': 800,//没安装
  'connect ECONNREFUSED': 800,//没启动服务
}
export const CodeName: Record<string, number> = {
  NoInstall: 800,
  NoService: 801,
}