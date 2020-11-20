<template>
  <el-tabs
    v-model="editableTabsValue"
    type="border-card"
    class="leftPanel"
    :class="{ showbar: showbar }"
    tab-position="left"
    @tab-click="tabClick"
  >
    <el-tab-pane
      v-for="(item, index) in editableTabs"
      :key="index"
      :label="item.title"
      :name="item.name"
    >
      <span slot="label"
        ><i class="el-icon-date icon"></i> {{ item.title }}</span
      >
      <keep-alive>
        <component v-bind:is="item.componentName" :data="item.data" @getChildData="getChildData">
          <div class="company_use" slot="header" v-if="item.header">
            <i class="iconfont iconVIP"></i><span>{{ item.header }}</span>
          </div>
        </component>
      </keep-alive>
    </el-tab-pane>
    <div class="hideBtn" @click.stop="setEditableTabsValue">
      <i
        :class="{
          'el-icon-arrow-left': editableTabsValue == 0,
          'el-icon-arrow-right': editableTabsValue != 0,
        }"
      ></i>
    </div>
  </el-tabs>
</template>

<script>
import floorPanel from "./floorPanel";
import wallPanel from "./wallPanel";
import casementPanel from "./casementPanel";

export default {
  name: "leftPanel",
  components: {
    floorPanel,
    wallPanel,
    casementPanel
  },
  data() {
    return {
      editableTabsValue: "wall",
      showbar: false,
      editableTabs: [
        {
          title: "墙体",
          name: "wall",
          componentName: "wallPanel",
          header: "可拖拽模型到此面板增加素材",
          
        },
        {
          title: "地板",
          name: "floor",
          componentName: "floorPanel",
          header: "可拖拽图片到此面板增加素材",
          
        },
        {
          title: "窗户",
          name: "casement",
          componentName: "casementPanel",
          header: "可拖拽模型到此面板增加素材",
          data: [],
        },
        {
          title: "标签",
          name: "label",
          componentName: "",
          data: [],
        },
      ],
    };
  },
  methods: {
    tabClick(e) {
      const that = this;
      this.showbar = true;
      let data = this.editableTabs.filter((item) => {
        return item.name === that.editableTabsValue;
      })
      this.changeNavData(data[0])
    },
    setEditableTabsValue() {
      this.showbar = !this.showbar;
      // this.$emit("getChildData", data);
    },
    changeNavData(data) {
      switch (data) {
        case 'wall':
          
          break;
      
        default:
          break;
      }
    },
    getChildData(data){
      // console.log("获取chidren数据", data);
      this.$emit("getChildData", data); 
    }
  },
};
</script>
<style>
.tool-bar .el-tabs--left.el-tabs--border-card .el-tabs__header.is-left {
  z-index: 2;
}
.tool-bar .el-tabs__content > div {
  height: 100%;
  width: 100%;
}
.tool-bar .el-tabs--left.el-tabs--border-card .el-tabs__item.is-left {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}
.tool-bar .el-tabs--left,
.tool-bar .el-tabs__content {
  overflow: inherit;
}
.tool-bar .el-tabs__content {
  height: 100%;
}
.tool-bar .el-tabs--border-card>.el-tabs__content {
  padding: 0;
}
</style>
<style lang="scss" scoped>
@import "@/assets/theme/option.scss";
.leftPanel.showbar {
  width: 360px;
}
.leftPanel {
  width: 80px;
  height: 100%;
  transition: width 0.4s;
  -moz-transition: width 0.4s; /* Firefox 4 */
  -webkit-transition: width 0.4s; /* Safari 和 Chrome */
  -o-transition: width 0.4s; /* Opera */
  i.icon {
    height: 30px;
    line-height: 30px;
    display: block;
    text-align: center;
    font-size: 20px;
  }

  .hideBtn {
    height: 85px;
    text-align: center;
    line-height: 85px;
    color: $TextColor;
    width: 20px;
    position: absolute;
    top: 50%;
    right: -20px;
    margin-top: -43px;
    cursor: pointer;
    border-radius: 24px 0 0 24px;
    background: linear-gradient(135deg, #ffa383, #f25b4a);
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
  }
  .my-tab-pane {
    padding: 10px 0;
  }
  .company_use {
    width: 100%;
    height: 40px;
    padding-right: 40px;
    text-align: right;
    line-height: 40px;
    font-size: 14px;
    color: $lessTextColor_3;
    background: linear-gradient(270deg, #eee1cf, #f9f3e9);
    cursor: pointer;
  }
  .iconVIP {
    margin-right: 10px;
    font-size: 18px;
    color: $smainColor;
  }
}
</style>
