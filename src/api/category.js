import request from '@/utils/request'
import qs from 'qs'

export function getCategoryTreeApi() {
  return request({
    url: '/categories',
    method: 'GET'
  })
}

export function getSelectedCategoryTreeIndex(cid) {
  return request({
    url: `/categories/${cid}/treeIndex`,
    method: 'GET'
  })
}

export function addCategory(data) {
  return request({
    url: `/categories`,
    method: 'post',
    data: qs.stringify(data)
  })
}

export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data: qs.stringify(data)
  })
}

export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}
