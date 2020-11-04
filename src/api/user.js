import request from '@/utils/request'
// import qs from 'qs'

export function getUserList(params) {
  return request({
    url: '/users',
    method: 'GET',
    params
  })
}

export function editUser(data) {
  return request({
    url: `/users/${data.userId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function addUser(data) {
  return request({
    url: `/users`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'DELETE'
  })
}

export function getAllSimpleUser() {
  return request({
    url: `/users/smp`,
    method: 'get'
  })
}
