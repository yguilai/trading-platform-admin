import { getCategoryTreeApi } from '@/api/category'

const state = {
  categoryTree: []
}

const mutations = {
  SET_CATEGORY_TREE: (state, tree) => {
    state.categoryTree = tree
  }
}

const actions = {
  getCategoryTree({ commit }) {
    return new Promise((resolve, reject) => {
      getCategoryTreeApi()
        .then(res => {
          const { data } = res
          commit('SET_CATEGORY_TREE', data)
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
