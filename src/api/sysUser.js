import request from '@/utils/request'
import qs from 'qs'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: qs.stringify(data)
  })
}

export function getInfo() {
  return request({
    url: '/sys-user/info',
    method: 'get'
  })
}

export function getSysUserPage(params) {
  return request({
    url: '/sys-users',
    method: 'get',
    params
  })
}

export function addSysUser(data) {
  return request({
    url: '/sys-users',
    method: 'post',
    data: qs.stringify(data)
  })
}

export function updateSysUserStatus(id) {
  return request({
    url: `/sys-users/${id}/s`,
    method: 'put'
  })
}

export function deleteSysUser(id) {
  return request({
    url: `/sys-users/${id}`,
    method: 'delete'
  })
}

export function updatePwd(params) {
  return request({
    url: '/sys-users/update-pwd',
    method: 'put',
    params
  })
}

export function changeUserName(id, newName) {
  return request({
    url: `/sys-users/${id}/n`,
    method: 'put',
    data: qs.stringify({ newName })
  })
}
