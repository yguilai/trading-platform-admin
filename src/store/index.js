import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import university from './modules/university'
import category from './modules/category'
import customer from './modules/customer'
import city from './modules/city'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    university,
    category,
    customer,
    city
  },
  getters
})

export default store
