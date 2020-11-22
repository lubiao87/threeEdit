const state = {
  threePoints: [], // 房屋轮廓点
  dialogVisible: false, // 小窗口显示隐藏
  tagetName: '请选择',
  grroveTool: '请选择',
  tagetColor: '#333',
  grroveColor: '#333',
  selectCasementMeth: null,
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
  SetTagetName(state, obj) {
    state.tagetName = obj;
  },
  SetGrroveTool(state, obj) {
    state.grroveTool = obj;
  },
  SetTagetColor(state, obj) {
    state.tagetColor = obj;
  },
  SetGrroveColor(state, obj) {
    state.grroveColor = obj;
  },
  SetSelectCasementMeth(state, obj) {
    state.selectCasementMeth = obj;
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
  Set_TagetName(context, obj) {
    context.commit("SetTagetName", obj);
  },
  Set_SetGrroveTool(context, obj) {
    context.commit("SetGrroveTool", obj);
  },
  Set_TagetColor(context, obj) {
    context.commit("SetTagetColor", obj);
  },
  Set_GrroveColor(context, obj) {
    context.commit("SetGrroveColor", obj);
  },
  Set_SelectCasementMeth(context, obj) {
    context.commit("SetSelectCasementMeth", obj);
  },
};
export default {
  namespaced: true, //用于在全局引用此文件里的方法时标识这一个的文件名
  state,
  // getters,
  mutations,
  actions
};
