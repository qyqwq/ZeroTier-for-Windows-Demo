import log from 'electron-log/renderer';
export const sendlog = {
  log(...arr: any[]) {
    // console.log(...arr)
    log.info(...arr);
  },
  error(...arr: any[]) {
    // console.error(...arr)
    log.info(...arr);
  }
}