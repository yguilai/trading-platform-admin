import request from '@/utils/request'

export function getQiniuToken() {
  return request({
    url: '/qntoken',
    method: 'GET'
  })
}

export function uploadImg2Qiniu(formdata) {
  return request({
    url: process.env.VUE_APP_QINIU_UPLOAD_API,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: false, // 禁止跨域携带cookie，带cookie在七牛上有可能出现跨域问题
    timeout: 30000,
    data: formdata
  })
}
