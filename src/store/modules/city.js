import { getCityTreeApi } from '@/api/city'

const state = {
  cityTree: []
}

const mutations = {
  SET_CITY_TREE(state, tree) {
    state.cityTree = [...tree]
  }
}

const actions = {
  getCityTree({ commit }) {
    return new Promise((resolve, reject) => {
      getCityTreeApi()
        .then(res => {
          commit('SET_CITY_TREE', res.data)
          resolve()
        })
        .catch(error => reject(error))
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
