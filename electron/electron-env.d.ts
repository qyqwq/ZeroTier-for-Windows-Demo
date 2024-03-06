/// <reference types="vite-plugin-electron/electron-env" />
import { AxiosRequestConfig } from 'axios'

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    DIST_ELECTRON: string
    DIST: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}
export interface nodejsRequest extends AxiosRequestConfig {
  type?: 'official' | 'local';
}