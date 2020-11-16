
/* eslint-disable */
import { mapState, mapGetters, mapActions } from "vuex"; //先要引入
import { Message } from 'element-ui';

export const listSearch = {
  data: function (params) {
    return {
      Userdata: null
    }
  },
  computed: {
    ...mapState({
      //这里的...是超引用，ES6的语法，意思是state里有多少属性值用户1可以在这里放多少属性值
      MyordersData: state => state.collection.MyordersData,
      MyrightComponentName: state => state.collection.rightComponentName,
      MyprojectData: state => state.collection.projectData,
      MysetScreenBtnList: state => state.collection.screenBtnList,
      MyViewer: state => state.collection.viewer,
      MyModelObj: state => state.collection.MyModelObj,
      MyModelList: state => state.collection.MyModelList,
      //里面定义的showFooter是指footerStatus.js里state的showFooter
    })
  },
  methods: {
    getUserdata() {
      this.uuid = this.$route.query.uuid;
      this.Userdata = this.$store.getters["collection/renderOrdersData"];
    },
    getViewerData() {
      this.viewer = this.$store.getters["collection/renderViewersData"];
    },
    ...mapActions("collection", [
      //collection是指modules文件夹下的collection.js
      "ORDERSDATA", //collection.js文件中的actions里的方法，在上面的@click中执行并传入实参
      "setViewer",
      "setComponentName",
      "setScreenBtnList"
    ]),
    MyMessage(type, message, callback){
      Message({
        showClose: true,
        message: message,
        type: type,
        duration: 2000,
        center: true,
        offset: 350,
        onClose: function(params) {
          if(callback){callback()}
        }
      });
    },
  },
  // created() {
  //   this.getUserdata()
  // }
}
