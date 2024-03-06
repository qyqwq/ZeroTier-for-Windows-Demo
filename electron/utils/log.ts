import log from 'electron-log/main';
import { join } from 'node:path'

log.transports.file.resolvePathFn = () => join(process.cwd(), 'logs/main.log');
log.transports.file.level = 'info';
log.info('----------------Log from the Node process-----------');
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