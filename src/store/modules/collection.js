const state = {
  threePoints: [], // 房屋轮廓点
  dialogVisible: false, // 小窗口显示隐藏
};
// const getters = {
//   renderOrdersData(state) {
//     //承载变化的ordersData
//     return state.threePoints;
//   }
// };
const mutations = {
  SetThreePoints(state, obj) {
    state.threePoints = obj;
  },
  SetDialogVisible(state, obj) {
    state.dialogVisible = obj;
  },
};
const actions = {
  Three_Points(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("SetThreePoints", obj);
  },
  Set_DialogVisible(context, obj) {
    context.commit("SetDialogVisible", obj);
  },
};
export default {
  namespaced: true, //用于在全局引用此文件里的方法时标识这一个的文件名
  state,
  // getters,
  mutations,
  actions
};
