import request from '@/utils/request'

export function getUniversityTree() {
  return request({
    url: '/universities/tree',
    method: 'GET'
  })
}

export function getUniversityTreeIndexList(id) {
  return request({
    url: `/universities/${id}/treeIndex`,
    method: 'GET'
  })
}

export function getAllUniversityPageByCity(city, params) {
  return request({
    url: `/universities/c/${city}`,
    method: 'get',
    params
  })
}

export function updateUniversityStatus(id) {
  return request({
    url: `universities/${id}/s`,
    method: 'put'
  })
}
