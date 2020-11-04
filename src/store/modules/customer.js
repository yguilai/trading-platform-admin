import { getAllSimpleUser } from '@/api/user'

const state = {
  smpUserList: []
}

const mutations = {
  SET_USER_LIST(state, list) {
    state.smpUserList = [...list]
  }
}

const actions = {
  getUserList({ commit }) {
    return new Promise((resolve, reject) => {
      getAllSimpleUser()
        .then(res => {
          const { data } = res
          commit('SET_USER_LIST', data)
          resolve()
        })
        .catch(err => reject(err))
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
