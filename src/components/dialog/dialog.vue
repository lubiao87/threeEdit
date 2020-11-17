<template>
  <el-container v-bind:id="id" v-if="dialogVisible">
    <el-header class="header">
      <div @mousedown.stop="mousedown">
        <h2 v-html="title"></h2>
        <i class="el-icon-close" @click="closeDialog"></i>
        <!-- <div @click.stop="closeDialog()" style="position: absolute;top: 0px; right: 20px;">
        <span>
          <svg class="icon" aria-hidden="false">
            <use xlink:href='#el-icon-ext-close'></use>
          </svg>
        </span>
        </div> -->
      </div>
    </el-header>
    <el-main>
      <slot></slot>
    </el-main>
    <el-footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="queryDialog">确 定</el-button>
      </span>
    </el-footer>
  </el-container>
</template>

<script>
import { listSearchMixin } from "../../mixin"; //混淆请求
  export default {
    name: 'Window',
    mixins: [listSearchMixin],
    props: {
      titlex: String,
      id: [String, Number]
    },
    data() {
      return {
        title: '标题',
        selectElement: ''
      }
    },
    // computed: {
    //   dialogVisible: {
    //     get: function () {
    //       return this.$store.state.dialogVisible
    //     },
    //     set: function (newValue) {
    //       this.$store.commit('newDialogVisible', newValue)
    //     }
    //   }
    // },
    methods: {
      closeDialog(e) {
        this.Set_DialogVisible(false)
        // this.Set_logQuery(false)
      },
      queryDialog(){
        this.$emit("queryDialog", true);
      },
      mousedown(event) {
        this.selectElement = document.getElementById(this.id)
        var div1 = this.selectElement
        this.selectElement.style.cursor = 'move'
        this.isDowm = true
        var distanceX = event.clientX - this.selectElement.offsetLeft
        var distanceY = event.clientY - this.selectElement.offsetTop
        // console.log(distanceX)
        // console.log(distanceY)
        document.onmousemove = function (ev) {
          var oevent = ev || event
          div1.style.left = oevent.clientX - distanceX + 'px'
          div1.style.top = oevent.clientY - distanceY + 'px'
        }
        document.onmouseup = function () {
          document.onmousemove = null
          document.onmouseup = null
          div1.style.cursor = 'default'
        }
      }
    }
  }
</script>

<style scoped lang="scss">
@import "@/assets/theme/option.scss";
.header {
    background-color: $bodyBgColor !important;
    height: 40px !important;
}
h2 {
    height: 40px;
    line-height: 40px;
}
.el-icon-close {
    font-size: 20px;
    position: absolute;
    right: 10px;
    top: 10px;
}
  .el-container {
    position: fixed;
    height: 500px;
    width: 300px;
    border: 1px;
    top: 60px;
    right: 0;
    border-radius: 2px;
  }

  .dialog-footer {
    text-align: right;
  }

  .el-main {
    background-color: white;
  }

  .el-footer {
    background-color: white;
  }

  .el-header {
    background-color: white;
    color: #333;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
  }
</style>