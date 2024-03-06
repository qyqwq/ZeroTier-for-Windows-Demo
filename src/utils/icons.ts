

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