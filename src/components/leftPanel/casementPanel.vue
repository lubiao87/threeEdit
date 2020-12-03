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
        <el-collapse-item title="增加窗口" name="增加窗口">
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
              <avue-input-number v-model="casementSizeL" @change="handleChangeSizeL"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementSizeW" @change="handleChangeSizeW"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementSizeH" @change="handleChangeSizeH"></avue-input-number>
            </div>
          </div>

          <el-row>
            <div class="option-list">x坐标</div>
            <div class="option-list">y坐标</div>
            <div class="option-list">z坐标</div>
            <div class="option-list" style="padding-left: 0">
              <avue-input-number v-model="casementPositonX" @change="handleChangePositonX"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementPositonY" @change="handleChangePositonY"></avue-input-number>
            </div>
            <div class="option-list">
              <avue-input-number v-model="casementPositonZ" @change="handleChangePositonZ"></avue-input-number>
            </div>
          </el-row>
          <div class="angle-block">
            <div class="block angle-box">角度</div>
            <div class="block">
              <span class="demonstration">X：</span>
              <el-slider
                v-model="casementAngleX"
                @change="changeAngleX"
                class="angle-slider"
                show-input
                :max="360"
              ></el-slider>
            </div>
            <div class="block">
              <span class="demonstration">Y：</span>
              <el-slider
                v-model="casementAngleY"
                @change="changeAngleY"
                class="angle-slider"
                show-input
                :max="360"
              ></el-slider>
            </div>
            <div class="block">
              <span class="demonstration">Z：</span>
              <el-slider
                v-model="casementAngleZ"
                @change="changeAngleZ"
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
              @change="ChangeCasementColor"
            ></avue-input-color>
          </el-row>
          <el-button
            size="medium"
            style="margin-top: 10px; width: 100%"
            @click="addCasement"
            >增加</el-button
          >
        </el-collapse-item>
        <el-collapse-item title="挖槽" name="挖槽">
          <div class="hh">
            <div>
              目标：
              <el-button
                size="medium"
                class="select-btn"
                :style="{ color: tagetColor }"
                @click="selectWall"
                >{{ tagetName }}</el-button
              >
            </div>
            <div>
              槽具：
              <el-button
                size="medium"
                class="select-btn"
                :style="{ color: grroveColor }"
                @click="selectCasement"
                >{{ grroveTool }}</el-button
              >
            </div>
            <el-button type="primary" @click="hollowingOut" class="primary"
              >确定</el-button
            >
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
      activeNames: ["增加窗口"],
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
      allowModification: false
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
      // console.log(val);
    },
    changeWall(data, i) {
      this.activeIndex = i;
      let parendData = {
        name: "显示窗户信息",
        parentName: "casement",
      };
      this.$emit("getChildData", parendData);
      this.Set_DialogVisible(true);
    },
    queryDialog() {
      let parendData = {
        name: "确定窗户",
        parentName: "casement",
      };
      this.$emit("getChildData", parendData);
    },
    hollowingOut() {
      let parendData = {
        name: "挖槽破窗",
        parentName: "casement",
      };
      this.$emit("getChildData", parendData);
    },
    addCasement() {
      let parendData = {
        name: "增加窗户",
        parentName: "casement",

        data: this.setData(),
      };
      this.$emit("getChildData", parendData);
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
    },
    modifyCasement(type) {
      if(this.selectCasementName) {
        this.allowModification = !this.allowModification;
      } else {
        this.allowModification = false;
      }
      
      let parendData = {
        name: "修改窗户",
        parentName: "casement",
        data: this.allowModification
      };
      this.$emit("getChildData", parendData);
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
    handleChangeSizeH(data) {
      // console.log(data);
      let parendData = {
        changeType: "scale",
        changeTaget: "y",
        changeData: data,
        changeName: "修改窗户",
        changeDataValue: "height"
      };
      this.$emit("getChildData", parendData);
    },
    handleChangeSizeW(data) {
      // console.log(data);
      let parendData = {
        changeType: "scale",
        changeTaget: "z",
        changeData: data,
        changeName: "修改窗户",
        changeDataValue: "width"
      };
      this.$emit("getChildData", parendData);
    },
    handleChangeSizeL(data) {
      // console.log(data);
      let parendData = {
        changeType: "scale",
        changeTaget: "x",
        changeData: data,
        changeName: "修改窗户",
        changeDataValue: "length"
      };
      this.$emit("getChildData", parendData);
    },
    handleChangePositonX(data) {
      // console.log(data);
      let parendData = {
        changeType: "position",
        changeTaget: "x",
        changeData: data,
        changeName: "修改窗户",
        changeDataValue: "x"
      };
      this.$emit("getChildData", parendData);
    },
    handleChangePositonY(data) {
      // console.log(data);
      let parendData = {
        changeType: "position",
        changeTaget: "y",
        changeData: data,
        changeName: "修改窗户",
        changeDataValue: "y"
      };
      this.$emit("getChildData", parendData);
    },
    handleChangePositonZ(data) {
      // console.log(data);
      let parendData = {
        changeType: "position",
        changeTaget: "z",
        changeData: data,
        changeName: "修改窗户",
        changeDataValue: "z"
      };
      this.$emit("getChildData", parendData);
    },

    changeAngleX(data) {
      // console.log(data);
      let parendData = {
        changeType: "rotation",
        changeTaget: "x",
        changeData: (data * Math.PI) / 180,
        changeName: "修改窗户",
        changeDataValue: "rotationX"
      };
      this.$emit("getChildData", parendData);
    },
    changeAngleY(data) {
      console.log(data);
      let parendData = {
        changeType: "rotation",
        changeTaget: "y",
        changeData: (data * Math.PI) / 180,
        changeName: "修改窗户",
        changeDataValue: "rotationY"
      };
      this.$emit("getChildData", parendData);
    },
    changeAngleZ(data) {
      console.log(data);
      let parendData = {
        changeType: "rotation",
        changeTaget: "z",
        changeData: (data * Math.PI) / 180,
        changeName: "修改窗户",
        changeDataValue: "rotationZ"
      };
      this.$emit("getChildData", parendData);
    },
    ChangeCasementColor(data) {

      if(data) {
        let parendData = {
        changeType: "material",
        changeTaget: "color",
        changeData: data,
        changeName: "修改窗户颜色",
      };
      this.$emit("getChildData", parendData);
      }

    },
    selectWall() {
      let parendData = {
        name: "目标墙体",
        parentName: "casement",
      };
      this.$emit("getChildData", parendData);
    },
    selectCasement() {
      let parendData = {
        name: "槽具窗户",
        parentName: "casement",
      };
      this.$emit("getChildData", parendData);
    },
  },
  watch: {
    selectCasementMeth(val) {
      // console.log(val)
      if(val) {
        this.casementSizeH = val.data.height;
      this.casementSizeW = val.data.width;
      this.casementSizeL = val.data.length;
      this.casementPositonX = val.data.x;
      this.casementPositonY = val.data.y;
      this.casementPositonZ = val.data.z;
      this.casementAngleX = val.data.rotationX;
      this.casementAngleY = val.data.rotationY;
      this.casementAngleZ = val.data.rotationZ;
      }
      
    }
  }
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
  }
  input[type="text"] {
    padding-left: 60px;
    background-color: transparent;
    height: 30px;
    line-height: 30px;
  }
  .inputName {
    position: absolute;
    left: 10px;
    top: 2px;
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
    .primary {
      width: 100%;
      margin-top: 10px;
    }
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
  .select-btn {
    width: 190px;
  }
  .el-color-picker--mini .el-color-picker__trigger {
    height: 24px;

    width: 24px;
  }
  .avue-input-color input[type="text"] {
    padding-left: 20px;
  }
}
</style>
