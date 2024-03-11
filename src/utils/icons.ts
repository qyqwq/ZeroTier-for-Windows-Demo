
//https://www.iconfont.cn/collections/detail?spm=a313x.search_index.0.da5a778a4.acb63a81kxrVfU&cid=5599

const pngicons = import.meta.glob('@/assets/*.png', { query: 'url' });
const svgicons = import.meta.glob('@/assets/*.svg', { query: 'url' });
const exportIcon: Record<string, any> = reactive({})

function assignIcons(iconarr: any, ext: string) {
  Object.keys(iconarr).forEach(key => {
    let mat = key.match(new RegExp(`([^\/]*)${ext}`))
    if (mat) {
      let str = mat[1]
      iconarr[key]().then((u: any) => {
        exportIcon[str] = u.default
      })
    }
  })
}
assignIcons(pngicons, '.png')
assignIcons(svgicons, '.svg')
console.log(exportIcon)
export default exportIcon