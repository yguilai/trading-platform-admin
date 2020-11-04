import request from '@/utils/request'
import qs from 'qs'

export function getGoodsList(params) {
  return request({
    url: '/goods',
    method: 'GET',
    params
  })
}

export function addGoods(data) {
  return request({
    url: '/goods',
    method: 'post',
    data: qs.stringify(data)
  })
}

export function updateGoods(id, data) {
  return request({
    url: `/goods/${id}`,
    method: 'put',
    data: qs.stringify(data)
  })
}

export function deleteGoods(id) {
  return request({
    url: `/goods/${id}`,
    method: 'delete'
  })
}
