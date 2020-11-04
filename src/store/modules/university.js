import { getUniversityTree } from '@/api/university'

const state = {
  universityTree: []
}

const mutations = {
  SET_UNIVERSITY_TREE: (state, tree) => {
    state.universityTree = [...tree]
  }
}

const actions = {
  // 获取高校树形列表
  getUniversityTree({ commit }) {
    return new Promise((resolve, reject) => {
      getUniversityTree()
        .then(res => {
          const { data } = res
          commit('SET_UNIVERSITY_TREE', data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
