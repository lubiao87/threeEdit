
/* eslint-disable */
import { mapState, mapGetters, mapActions } from "vuex"; //先要引入
// import { Message } from 'element-ui';

export const listSearch = {
  data: function () {
    return {
      Userdata: null
    }
  },
  computed: {
    ...mapState({
      //这里的...是超引用，ES6的语法，意思是state里有多少属性值用户1可以在这里放多少属性值
      threePoints: state => state.collection.threePoints,
      dialogVisible: state => state.collection.dialogVisible,
      //里面定义的threePoints是指footerStatus.js里state的threePoints
    })
  },
  methods: {
    ...mapActions("collection", [
      //collection是指modules文件夹下的collection.js
      "Three_Points", //collection.js文件中的actions里的方法，在上面的@click中执行并传入实参
      "Set_DialogVisible",
    ]),
    recoveryCameraPotion(){
      if (this.controls) {
        this.controls.dispose();
        this.controls = null;
      }
      let curve = new THREE.CatmullRomCurve3([
        this.camera.position,
        this.clearPosition,
      ]);
      this.animatePoints = curve.getPoints(100); //分段数100，返回101个顶点
    }
  },
  // created() {
  //   this.getUserdata()
  // }
}
