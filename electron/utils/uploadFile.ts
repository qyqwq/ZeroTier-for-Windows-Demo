import axios from "axios";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

let _cancelUploadObj = {};
const controller = new AbortController();

axios.get('/foo/bar', {
   signal: controller.signal
}).then(function(response) {
   //...
});
// 取消请求
controller.abort()


function uploadFileBlock(data, processCallback, cancelFun){
  return axios({
    // url: _prefix + '/upload/block',
    method: 'post',
    data,
    onUploadProgress: processCallback,
    // cancelToken: new CancelToken(function excutor(c) {
    //   cancelFun.cancel = c;
    // })
  })
}
function doUploadFileBlock(uploadFile) {
    let index = 1;
    let file = uploadFile;
    const fileSize = file.size;
    let start = 0;
    let end = 0;
    let that = this;

    function handleUploadSuccess() {
      // upload success
    }

    function handleUploadError() {
      // upload error
    }
    //进度条
    function _handleUploadProgress(progressEvent) {
      let percent = parseInt((progressEvent.loaded + start) / fileSize * 100, 10);
      // 如果格式话之后超过了100%之后，直接变成100%
      if (percent > 100) {
        percent = 100;
      }
      this.progress = percent;
    }


    function uploadFileByBlock() {
      if (start + MAX_FILE_SIZE >= fileSize) {
        end = fileSize;
      } else {
        end = start + MAX_FILE_SIZE;
      }
      const fileBlock = file.slice(start, end);
      const form = new FormData();
      form.append('file', fileBlock);
      form.append('index', index);
      form.append('size', end - start);

     uploadFileBlock(form, _handleUploadProgress, _cancelUploadObj).then((data) => {
        if (start + MAX_FILE_SIZE >= fileSize) {
          handleUploadSuccess();
        } else {
          start += MAX_FILE_SIZE;
          index += 1;
          uploadFileByBlock();
        }
      }).catch(() => {
        handleUploadError();
      });
    }

    uploadFileByBlock();
}


// function doCancel(){
//     cancelUploadObj && cancelUploadObj.cancel && cancelUploadObj = {};.cancel();
//     cancelUploadObj = {};
// }