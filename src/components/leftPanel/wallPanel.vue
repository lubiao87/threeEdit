<template>
  <div class="wallPanel">
    <!-- <slot name="header"></slot> -->
    <slot name="header"></slot>
    <div
      v-for="(item, index) in data"
      :key="index"
      class="item float_L"
      @click="changeWall(item, index)"
    >
      <img
        :src="item.url"
        :alt="item.name"
        srcset=""
        class="material"
        :class="{ active: activeIndex === index }"
      />
      <div class="stip">
        {{ item.name }}
      </div>
    </div>
    <dialogp :id="layerId" @queryDialog="queryDialog">
      <el-row style="position: relative; margin-top: 10px;">
        <el-select v-model="GeometryType" placeholder="请选择">
          <el-option
            v-for="item in GeometryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <span class="inputName">轮廓：</span>
      </el-row>
      <el-row style="margin-top: 10px;">
        <span class="inputName">名称：</span>
        <el-input v-model="wallName" placeholder="请输入内容"></el-input>
      </el-row>

      <div class="changeSizeArea" v-if="GeometryType === '四边形'">
        <div class="option-list" style="padding-left: 0">
          <avue-input-number v-model="drawSizeL"></avue-input-number>
          <span class="inputName">长：</span>
        </div>
        <div class="option-list">
          <avue-input-number v-model="drawSizeW"></avue-input-number>
          <span class="inputName">宽：</span>
        </div>
      </div>
      <div class="changeSizeArea" v-if="GeometryType === '四边形'">
        <div class="option-list" style="padding-left: 0">
          <avue-input-number v-model="drawSizeH"></avue-input-number>
          <span class="inputName">高：</span>
        </div>
        <div class="option-list">
          <avue-input-number v-model="drawSizeT"></avue-input-number>
          <span class="inputName">厚：</span>
        </div>
      </div>
      <el-row>
        <div>颜色</div>
        <avue-input-color
          placeholder="请选择颜色"
          v-model="wallColor"
          @change="ChangeWallColor"
        ></avue-input-color>
      </el-row>
      <el-row class="btn-list">
        <el-button
          size="small"
          v-if="GeometryType !== '绘画'"
          @click="addBaseWall"
          >{{ threePoints.length > 0 ? "删除" : "增加" }}</el-button
        >
        <el-button size="small" v-if="GeometryType === '绘画'" disabled
          >撤销</el-button
        >
        <el-button size="small" v-if="GeometryType === '绘画'" @click="painting"
          >重绘</el-button
        >
        <el-button
          size="small"
          v-if="GeometryType === '绘画'"
          @click="wallClose"
          >闭合</el-button
        >
      </el-row>
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
  //     type: Array,
  //     default: [], //默认值
  //   },
  // },
  data: () => {
    return {
      content: "",
      layerId: Math.random()
        .toString(36)
        .substr(3, 10),
      drawPoint: [],
      drawIng: false,
      layerOpen: null,
      parendData: {},
      drawSizeL: 6,
      drawSizeW: 10,
      drawSizeH: 3,
      wallColor: "rgba(32, 76, 159, 0.6)",
      activeIndex: 0,
      drawSizeT: 0.2,
      data: [
        {
          name: "基础墙体",
          url: "img/wall/wall.png",
          size: [1, 1],
          parentName: "wall",
        },
        {
          name: "贴图1墙体",
          url: "img/wall/wall2.png",
          size: [1, 1],
          parentName: "wall",
        },
      ],
      GeometryType: "四边形",
      GeometryOptions: [
        {
          value: "四边形",
          label: "四边形",
        },
        {
          value: "绘画",
          label: "绘画",
        },
      ],
      GeometrySelect: null,
      wallName: "",
    };
  },
  created() {
    this.wallName = this.setlName("墙_");
  },
  methods: {
    painting() {
      this.parendData = {
        name: "绘画墙轮廓",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
    },
    wallClose() {
      this.parendData = {
        name: "闭合墙轮廓",
        parentName: "wall",
      };
      this.$emit("getChildData", this.parendData);
    },
    changeWall(data, i) {
      this.activeIndex = i;
      this.parendData = {
        name: "修改墙轮廓",
        parentName: "wall",
        data: data,
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
    queryDialog(flag) {
      if (flag) {
        this.parendData = {
          name: "确定墙轮廓",
          parentName: "wall",
        };
      } else {
        this.parendData = {
          name: "取消墙轮廓",
          parentName: "wall",
        };
      }

      this.$emit("getChildData", this.parendData);
    },
    ChangeWallColor(val) {
      if (val) {
        let parendData = {
          changeType: "material",
          changeTaget: "color",
          changeData: val,
          changeName: "修改墙体颜色",
        };
        this.$emit("getChildData", parendData);
      }
    },
    addBaseWall() {
      let data = {
        name: "增加墙",
        parentName: "wall",
        drawSizeL: this.drawSizeL,
        drawSizeW: this.drawSizeW,
        drawSizeH: this.drawSizeH,
        drawSizeT: this.drawSizeT,
        wallColor: this.wallColor,
        wallName: this.wallName,
      };
      this.$emit("getChildData", data);
      this.wallName = this.setlName("墙_");
    },
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
        // this.drawSize = {
        //   w: (Hmax - Hmin).toFixed(2),
        //   h: (Xmax - Xmin).toFixed(2),
        // };
        this.drawSizeW = (Hmax - Hmin).toFixed(2);
        this.drawSizeL = (Xmax - Xmin).toFixed(2);
      }
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/theme/option.scss";
@import "@/assets/theme/leftPanel.scss";
.wallPanel {
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  input[type="text"] {
    padding-left: 60px;
  }
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
      // padding-left: 13px;
      // padding-right: 12px;
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
  .changeSizeArea {
    margin-top: 10px;
    overflow: hidden;
    position: relative;
    input[type="text"] {
      padding-left: 60px;
      background-color: transparent;
    }
  }

  .el-collapse {
    border-top: 0px solid transparent;
  }
  .el-collapse-item__content {
    position: relative;
  }
  .el-select {
    width: 100%;
  }
  input[type="text"] {
    background-color: transparent;
    border-color: $borderColor;
    color: $lessTextColor;
    text-align: center;
  }
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
  .changeSizeArea {
    margin-top: 10px;
    overflow: hidden;
    position: relative;
    input[type="text"] {
      padding-left: 60px;
      background-color: transparent;
    }
  }
  .inputName {
    position: absolute;
    left: 5px;
    top: 8px;
    z-index: 1;
    width: 58px;
    text-align: right;
  }
  .btn-list {
    margin-top: 10px;
    display: flex;
    .el-button {
      flex: 1;
    }
  }
  .hh {
    text-align: left;
    padding: 10px;
  }
  .option-list {
    position: relative;
    width: 50%;
    float: left;
    padding-left: 4px;
    // margin-top: 10px;
    .inputName {
      top: 6px;
    }
    .name {
      position: absolute;
      left: 8px;
      top: 3px;
      z-index: 1;
    }
    .el-input-number {
      width: 100%;
      line-height: 24px;
    }
    .el-input__inner {
      height: 34px;
      line-height: 34px;
    }
    .el-input-number.is-controls-right .el-input-number__decrease,
    .el-input-number.is-controls-right .el-input-number__increase {
      line-height: 16px;
      height: 16px;
    }
    .el-input-number.is-controls-right .el-input__inner {
      padding-left: 54px;
      padding-right: 24px;
    }
    .el-input-number__decrease,
    .el-input-number__increase {
      width: 28px;
    }
    [class^="el-icon-"] {
      line-height: 12px;
    }
  }
}
</style>
