<template>
  <div class="wallPanel">
    <!-- <slot name="header"></slot> -->
    <!-- <div v-for="(item, index) in data" :key="index" class="item float_L">
      <img :src="item.url" :alt="item.name" srcset="" class="material" />
    </div> -->
    <div class="contentTabAreaNew">
      <div class="tabItemBig active float_L">地基尺寸</div>
      <span class="edit float_R" @click="changeWall">修改</span>
    </div>
    <div class="item changeSizeArea">
      <div class="changeSizeBtn">
        <span>{{ drawSize.h }} m</span><span class="desc">长</span>
      </div>
      <i class="margin_i"></i>
      <div class="changeSizeBtn">
        <span>{{ drawSize.w }} m</span><span class="desc">宽</span>
      </div>
    </div>
    <div class="contentTabAreaNew">
      <div class="tabItemBig active float_L">墙体属性</div>
      <span class="edit float_R" @click="changeWall">修改</span>
      <!-- <span class="edit float_R">编辑</span> -->
    </div>
    <div class="item changeSizeArea">
      <div class="changeSizeBtn">
        <span>3.20 m</span><span class="desc">高度</span>
      </div>
      <i class="margin_i"></i>
      <div class="changeSizeBtn">
        <span>0.20 m</span><span class="desc">厚度</span>
      </div>
    </div>
    <dialogp :id="layerId" @queryDialog="queryDialog">
      <div class="item changeSizeArea">
        <div class="changeSizeBtn">
          <span>{{ drawSize.h }} m</span><span class="desc">长</span>
        </div>
        <i class="margin_i"></i>
        <div class="changeSizeBtn">
          <span>{{ drawSize.w }} m</span><span class="desc">宽</span>
        </div>
      </div>
      <el-button type="primary" @click="painting">绘画</el-button>
      <el-button type="primary" @click="wallClose">闭合</el-button>
    </dialogp>
  </div>
</template>

<script>
// import { layerOpen } from "@/map/layerOpen";
import dialogp from "@/components/dialog/dialog";
import { listSearchMixin } from "../../mixin"; //混淆请求
export default {
  name: "wallPanel",
  components: {
    dialogp,
  },
  mixins: [listSearchMixin],
  // props: {
  //   data: {
  //     type: Object,
  //     default: {
  //       drawSize: {
  //         h: 6,
  //         w: 10,
  //       },
  //     }, //默认值
  //   },
  // },
  data: () => {
    return {
      content: "",
      layerId: 1,
      drawPoint: [],
      drawIng: false,
      layerOpen: null,
      parendData: {},
      drawSize: {
        h: 6,
        w: 10,
      },
    };
  },
  created() {
    console.log("this.data", this.data);
  },
  methods: {
    painting() {
      this.parendData = {
        name: "绘画墙轮廓",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
    },
    wallClose(){
      this.parendData = {
        name: "闭合墙轮廓",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
    },
    changeWall() {
      this.parendData = {
        name: "修改墙轮廓",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
      this.Set_DialogVisible(true);
    },
    btnCalback(index, layero) {
      console.log(index, layero);
    },
    btnCancel() {
      this.drawIng = false; // 停止绘画
      console.log("关闭按钮");
      this.parendData = {
        name: "关闭",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
    },
    queryDialog() {
      this.parendData = {
        name: "确定墙轮廓",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
    }
  },
  watch: {
    threePoints(val) {
      if (val.length > 0) {
        // console.log(val)
        let Xmax = val[0].x,
          Xmin = val[0].x,
          Hmax = val[0].z,
          Hmin = val[0].z;
        val.forEach((item) => {
          if (item.x > Xmax) {
            //求最大值的假设
            Xmax = item.x;
          }
          if (item.x < Xmin) {
            //求最大值的假设
            Xmin = item.x;
          }
          if (item.z > Hmax) {
            //求最大值的假设
            Hmax = item.z;
          }
          if (item.z < Hmin) {
            Hmin = item.z;
          }
        });
        console.log(Xmax, Xmin, Hmax, Hmin);
        this.drawSize = {
          w: (Hmax - Hmin).toFixed(2),
          h: (Xmax - Xmin).toFixed(2),
        };
      }
    },
  },
};
</script>

<style lang="scss">
.wallPanel {
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  width: 270px;
  .contentTabAreaNew {
    width: 100%;
    height: 50px;
    .tabItemBig {
      height: 50px;
      line-height: 50px;
      margin-left: 25px;
      font-size: 16px;
      color: #666;
      display: inline-block;
    }
    .edit {
      font-size: 16px;
      color: #ff4555;
      float: right;
      line-height: 50px;
      margin-right: 25px;
      cursor: pointer;
    }
  }
  .item {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: justify;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
  }
  .item.changeSizeArea {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    .changeSizeBtn {
      margin-right: 10px;
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      height: 36px;
      border: 1px solid #dadfe4;
      border-radius: 2px;
      font-size: 14px;
      padding-left: 13px;
      padding-right: 12px;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: center;
      cursor: pointer;
      .desc {
        color: #999;
        font-size: 12px;
        margin-left: 6px;
      }
    }
  }

  // .item {
  //   width: 88px;
  //   height: 100px;
  //   padding: 10px 8px 10px 5px;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   img {
  //     border: 1px solid #ccc;
  //     cursor: pointer;
  //   }
  //   img:hover {
  //     -webkit-box-shadow: 0 2px 6px 1px #c6cad1;
  //     box-shadow: 0 2px 6px 1px #c6cad1;
  //   }
  // }
  // .material {
  //   width: 100%;
  // }
}
</style>
