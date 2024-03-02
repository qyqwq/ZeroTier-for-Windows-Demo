export const errcodeMatch: Record<string, number> = {
  'no such file': 800,//没安装
  'connect ECONNREFUSED': 801,//没启动服务
  '401': 401,
  '404': 404
}
export const CodeName: Record<string, number> = {
  NoInstall: 800,
  NoService: 801,
  NoToken: 401,
  NoFind: 404
}