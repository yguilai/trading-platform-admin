import request from '@/utils/request'

export function getStatisticsApi() {
  return request({
    url: '/statistics',
    method: 'get'
  })
}
