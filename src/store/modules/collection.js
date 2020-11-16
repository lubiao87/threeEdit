const state = {
  collects: [], //初始化一个colects数组, 示例
  MyordersData: null, // map3d 数据
  viewer: null,
  rightComponentName: "", // 右侧面板名称
  projectData: {}, // 用户数据
  screenBtnList: [], // 全屏按钮列表
  MyModelObj: {}, // 显示模型
  MyModelList: [] // 我的模型列表
};
const getters = {
  renderCollects(state) {
    //承载变化的collects
    return state.collects;
  },
  renderOrdersData(state) {
    //承载变化的ordersData
    return state.MyordersData;
  },
  renderViewersData(state) {
    //承载变化的ordersData
    return state.viewer;
  },
  renderComponentName(state) {
    //承载变化的ordersData
    return state.rightComponentName;
  },
  renderProjectData(state) {
    //承载变化的ordersData
    return state.projectData;
  },
  renderScreenBtnList(state) {
    //承载变化的ordersData
    return state.screenBtnList;
  },
  renderMyModelObj(state) {
    //承载变化的ordersData
    return state.MyModelObj;
  },
  renderMyModelList(state) {
    //承载变化的ordersData
    return state.MyModelList;
  },
};
const mutations = {
  pushCollects(state, items) {
    //如何变化collects,插入items
    state.collects.push(items);
  },
  ORDERSDATA(state, obj) {
    state.MyordersData = obj;
  },
  setViewer(state, obj) {
    state.viewer = obj;
  },
  setComponentName(state, obj) {
    state.rightComponentName = obj;
  },
  setProjectData(state, obj) {
    state.projectData = obj;
  },
  setScreenBtnList(state, obj) {
    state.screenBtnList = obj;
  },
  setMyModelObj(state, obj) {
    state.MyModelObj = obj;
  },
  setMyModelList(state, obj) {
    state.MyModelList = obj;
  },
};
const actions = {
  invokePushItems(context, item) {
    //触发mutations里面的pushCollects ,传入数据形参item 对应到items
    context.commit("pushCollects", item);
  },
  ORDERS_DATA(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("ORDERSDATA", obj);
  },
  set_viewer(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("setViewer", obj);
  },
  set_ComponentName(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("setComponentName", obj);
  },
  set_ProjectData(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("setProjectData", obj);
  },
  set_ScreenBtnList(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("setScreenBtnList", obj);
  },
  set_MyModelObj(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("setMyModelObj", obj);
  },
  set_MyModelList(context, obj) {
    //自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit("setMyModelList", obj);
  },
};
export default {
  namespaced: true, //用于在全局引用此文件里的方法时标识这一个的文件名
  state,
  getters,
  mutations,
  actions
};
