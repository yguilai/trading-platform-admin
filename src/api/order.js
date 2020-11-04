import request from '@/utils/request'
import qs from 'qs'

export function getOrderPage(params) {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

export function getOneOrderByCode(code) {
  return request({
    url: `/orders/c/${code}`,
    method: 'get'
  })
}

export function updateOrderStatus(id, status) {
  return request({
    url: `/orders/${id}/s`,
    method: 'put',
    data: qs.stringify({ status })
  })
}

export function deleteOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'delete'
  })
}
