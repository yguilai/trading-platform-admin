const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  universityTree: state => state.university.universityTree,
  categoryTree: state => state.category.categoryTree,
  userList: state => state.customer.smpUserList,
  cityTree: state => state.city.cityTree
}
export default getters
