<template>
  <div class="casementPanel">
    <slot name="header"></slot>
    <div class="contentTabAreaNew">
      <div class="tabItemBig active float_L">窗口尺寸</div>
      <span class="edit float_R" @click="changeWall">修改</span>
    </div>
    <div class="item changeSizeArea">
      <div class="changeSizeBtn">
        <span>{{ casementSize.h }} m</span><span class="desc">长</span>
      </div>
      <div class="changeSizeBtn">
        <span>{{ casementSize.w }} m</span><span class="desc">宽</span>
      </div>
      <div class="changeSizeBtn">
        <span>{{ casementSize.l }} m</span><span class="desc">高</span>
      </div>
    </div>
    <div class="contentTabAreaNew">
      <div class="tabItemBig active float_L">窗口位置</div>
      <span class="edit float_R" @click="changeWall">修改</span>
    </div>
    <div class="item changeSizeArea">
      <div class="changeSizeBtn">
        <span>{{ casementPositon.x }} m</span><span class="desc">X</span>
      </div>
      <div class="changeSizeBtn">
        <span>{{ casementPositon.y }} m</span><span class="desc">Y</span>
      </div>
      <div class="changeSizeBtn">
        <span>{{ casementPositon.z }} m</span><span class="desc">Z</span>
      </div>
    </div>
    <div class="contentTabAreaNew">
      <div class="tabItemBig active float_L">窗口角度</div>
      <span class="edit float_R" @click="changeWall">修改</span>
    </div>
    <div class="item changeSizeArea">
      <div class="changeSizeBtn">
        <span>{{ casementAngle.x }} °</span><span class="desc">X</span>
      </div>
      <div class="changeSizeBtn">
        <span>{{ casementAngle.y }} °</span><span class="desc">Y</span>
      </div>
      <div class="changeSizeBtn">
        <span>{{ casementAngle.z }} °</span><span class="desc">Z</span>
      </div>
    </div>

    <dialogp :id="layerId" @queryDialog="queryDialog">
      <div style="width: 100%;height: 40px;">
        <div class="float_L">长方体</div>
        <div class="float_L">圆柱体</div>
        <div class="float_L">三角体</div>
      </div>

      <div class="item changeSizeArea">
        <div class="changeSizeBtn">
          <span>{{ casementSize.h }} m</span><span class="desc">长</span>
        </div>
        <div class="changeSizeBtn">
          <span>{{ casementSize.w }} m</span><span class="desc">宽</span>
        </div>
        <div class="changeSizeBtn">
          <span>{{ casementSize.l }} m</span><span class="desc">高</span>
        </div>
      </div>
      <el-button @click="addCasement">增加</el-button>
      <el-button type="primary" @click="hollowingOut">挖槽</el-button>
      <el-button type="primary" @click="modifyCasement">修改</el-button>
      <div  class="hh">
          <div>
            目标： <span></span>
          </div>
          <div>
            槽具： <span></span>
          </div>
      </div>
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
      layerId: 632,
      drawPoint: [],
      drawIng: false,
      layerOpen: null,
      parendData: {},
      casementSize: {
        h: 2,
        w: 0.2,
        l: 1.5,
      },
      casementPositon: {
        x: 0,
        y: 0,
        z: 0
      },
      casementAngle: {
        x: 0,
        y: 0,
        z: 0
      }
    };
  },
  created() {
    console.log("this.data", this.data);
  },
  methods: {
    changeWall() {
      this.parendData = {
        name: "修改窗户",
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
        name: "增加窗口",
        parentName: "casement",
        data: {
          casementSize: this.casementSize,
          casementPositon: this.casementPositon,
          casementAngle: this.casementAngle,
        }
      };
      this.$emit("getChildData", this.parendData);
    },
    modifyCasement(){
      this.parendData = {
        name: "修改窗口",
        parentName: "casement",
        data: {
          casementSize: this.casementSize,
          casementPositon: this.casementPositon,
          casementAngle: this.casementAngle,
        }
      };
      this.$emit("getChildData", this.parendData);
    }
  }
};
</script>

<style lang="scss">
.casementPanel {
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
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
    padding-left: 10px;
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
      //   padding-left: 13px;
      //   padding-right: 12px;
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
  .hh {
    text-align: left;
    padding: 10px;
  }
}
</style>
