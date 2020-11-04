import request from '@/utils/request'

export function getCityTreeApi() {
  return request({
    url: '/cities/tree',
    method: 'get'
  })
}
