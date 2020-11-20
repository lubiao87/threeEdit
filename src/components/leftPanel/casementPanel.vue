<template>
  <div class="casementPanel">
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
      <el-collapse v-model="activeNames" @change="handleChange" accordion>
        <el-collapse-item title="窗口参数" name="窗口参数">
          <el-select v-model="GeometryType" placeholder="请选择">
            <el-option
              v-for="item in GeometryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <span class="inputName">几何体：</span>
          <div class="changeSizeArea" v-if="GeometryType === '长方体'">
            <el-row>
              <span class="inputName">名称：</span>
              <el-input
                v-model="casementName"
                placeholder="请输入内容"
              ></el-input>
            </el-row>
            <div class="option-list">长</div>
            <div class="option-list">宽</div>
            <div class="option-list">高</div>
            <div class="option-list" style="padding-left: 0">
              <avue-input-number v-model="casementSizeH"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementSizeW"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementSizeL"></avue-input-number>
            </div>
          </div>

          <el-row>
            <div class="option-list">x坐标</div>
            <div class="option-list">y坐标</div>
            <div class="option-list">z坐标</div>
            <div class="option-list" style="padding-left: 0">
              <avue-input-number v-model="casementPositonX"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementPositonY"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementPositonZ"></avue-input-number>
            </div>
          </el-row>
          <div class="angle-block">
            <div class="block angle-box">角度</div>
            <div class="block">
              <span class="demonstration">X：</span>
              <el-slider
                @change="changeAngleX"
                v-model="casementAngleX"
                class="angle-slider"
                show-input
                :max="360"
              ></el-slider>
            </div>
            <div class="block">
              <span class="demonstration">Y：</span>
              <el-slider
                @change="changeAngleY"
                v-model="casementAngleY"
                class="angle-slider"
                show-input
                :max="360"
              ></el-slider>
            </div>
            <div class="block">
              <span class="demonstration">Z：</span>
              <el-slider
                @change="changeAngleZ"
                v-model="casementAngleZ"
                class="angle-slider"
                show-input
                :max="360"
              ></el-slider>
            </div>
          </div>

          <el-row>
            <div>颜色</div>
            <avue-input-color
              placeholder="请选择颜色"
              v-model="casementColor"
            ></avue-input-color>
          </el-row>

          <el-row class="btn-list">
            <el-button size="small" @click="addCasement">增加</el-button>
            <el-button size="small" @click="modifyCasement">修改</el-button>
            <el-button size="small">删除</el-button>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="挖槽" name="挖槽">
          <div class="hh">
            <div>目标： <span></span></div>
            <div>槽具： <span></span></div>
            <el-button type="primary" @click="hollowingOut">确定</el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </dialogp>
  </div>
</template>

<script>
// import { layerOpen } from "@/map/layerOpen";
import dialogp from "@/components/dialog/dialog";
import { listSearchMixin } from "../../mixin"; //混淆请求
export default {
  name: "casementPanel",
  components: {
    dialogp,
  },
  mixins: [listSearchMixin],
  data: () => {
    return {
      content: "",
      casementName: "",
      layerId: Math.random().toString(36).substr(3, 10),
      drawPoint: [],
      drawIng: false,
      layerOpen: null,
      parendData: {},
      casementSizeH: 1,
      casementSizeW: 1,
      casementSizeL: 1,
      casementPositonX: 0,
      casementPositonY: 0,
      casementPositonZ: 0,
      casementAngleX: 0,
      casementAngleY: 0,
      casementAngleZ: 0,
      casementColor: "rgba(32, 76, 159, 0.6)",
      activeNames: ["窗口参数"],
      GeometryType: "长方体",
      GeometryOptions: [
        {
          value: "长方体",
          label: "长方体",
        },
        {
          value: "圆柱体",
          label: "圆柱体",
        },
        {
          value: "三角体",
          label: "三角体",
        },
        {
          value: "球体",
          label: "球体",
        },
      ],
      data: [
        {
          name: "自定义",
          url: "img/casement/casement.png",
          size: [1, 1],
          parentName: "floor",
        },
      ],
      activeIndex: -1,
    };
  },
  created() {
    let date = new Date();
    let name =
      "窗户_" +
      date.getFullYear() +
      (date.getMonth() + 1) +
      date.getDate() +
      date.getHours() +
      date.getMinutes() +
      date.getSeconds();
    this.casementName = name;
    console.log("this.data", this.data);
  },
  methods: {
    handleChange(val) {
      console.log(val);
    },
    changeWall(data, i) {
      this.activeIndex = i;
      this.parendData = {
        name: "显示窗户信息",
        parentName: "casement",
      };
      this.$emit("getChildData", this.parendData);
      this.Set_DialogVisible(true);
    },
    queryDialog() {
      this.parendData = {
        name: "确定窗户",
        parentName: "casement",
      };
      this.$emit("getChildData", this.parendData);
    },
    hollowingOut() {
      this.parendData = {
        name: "挖槽破窗",
        parentName: "casement",
      };
      this.$emit("getChildData", this.parendData);
    },
    addCasement() {
      this.parendData = {
        name: "增加窗户",
        parentName: "casement",

        data: this.setData(),
      };
      this.$emit("getChildData", this.parendData);
    },
    modifyCasement(type) {
      this.parendData = {
        name: "修改窗户",
        parentName: "casement",
      };
      this.$emit("getChildData", this.parendData);
    },
    setData() {
      let data = {
        casementSize: {
          h: this.casementSizeH,
          w: this.casementSizeW,
          l: this.casementSizeL,
        },
        casementPositon: {
          x: this.casementPositonX,
          y: this.casementPositonY,
          z: this.casementPositonZ,
        },
        casementAngle: {
          x: this.casementAngleX,
          y: this.casementAngleY,
          Z: this.casementAngleZ,
        },
        casementColor: this.casementColor,
        casementName: this.casementName,
      };
      return data;
    },
    changeAngleX(data) {
      console.log(data);
    },
    changeAngleY(data) {
      console.log(data);
    },
    changeAngleZ(data) {
      console.log(data);
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/theme/option.scss";
@import "@/assets/theme/leftPanel.scss";

.casementPanel {
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
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
    left: 10px;
    top: 8px;
    z-index: 1;
    width: 54px;
    text-align: right;
  }
  .btn-list {
    margin-top: 10px;
    .el-button + .el-button {
      margin-left: 4px;
    }
  }
  .hh {
    text-align: left;
    padding: 10px;
  }
  .option-list {
    position: relative;
    width: 33.3%;
    float: left;
    padding-left: 4px;
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
      height: 24px;
      line-height: 24px;
    }
    .el-input-number.is-controls-right .el-input-number__decrease,
    .el-input-number.is-controls-right .el-input-number__increase {
      line-height: 12px;
      height: 12px;
    }
    .el-input-number.is-controls-right .el-input__inner {
      padding-left: 6px;
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
  .block {
    display: flex;
    display: -webkit-box;
    display: -ms-flexbox;
    .demonstration {
      width: 40px;
      display: inline-block;
      height: 30px;
      line-height: 28px;
      .el-slider__runway.show-input {
        margin-right: 90px;
      }
      .el-slider__input {
        width: 100px;
      }
    }
    .angle-slider {
      flex: 1;
      .el-input-number--small .el-input-number__decrease,
      .el-input-number--small .el-input-number__increase {
        width: 22px;
      }
      .el-input--small .el-input__inner {
        height: 24px;
        line-height: 24px;
      }
      .el-input-number--small .el-input__inner {
        padding-left: 22px;
        padding-right: 22px;
      }
      .el-input-number--small {
        line-height: 24px;
      }
      .el-slider__runway.show-input {
        margin-right: 100px;
      }
      .el-slider__input {
        width: 80px;
      }
      .el-slider__runway {
        margin: 12px 0;
      }
    }
  }
  .angle-block {
    background-color: rgb(245, 247, 250);
    padding: 4px 6px;
    margin-top: 6px;
    border-radius: 6px;
    .angle-box {
      padding-left: 4px;
    }
  }
}
</style>
