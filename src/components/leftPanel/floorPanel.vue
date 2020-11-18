<template>
  <div class="floorPanel">
    <slot name="header"></slot>
    <div v-for="(item, index) in data" :key="index" class="item float_L">
      <img :src="item.url" :alt="item.name" srcset="" class="material" @click="imgClick(item, index)" :class="{active: activeIndex === index}"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: [], //默认值
    },
  },
  data: () => {
    return {
      activeIndex: -1
    }
  },
  created() {
    console.log("this.data", this.data);
  },
  methods: {
    imgClick(data, i) {
      this.activeIndex = i;
      this.parendData = {
        name: "选择地板",
        parentName: "floor",
        data: data
      };
      this.$emit("getChildData", this.parendData);
    }
  }
};
</script>

<style lang="scss">
.floorPanel {
  width: 100%;
  height: 100%;
  .item {
    width: 88px;
    height: 100px;
    padding: 10px 8px 10px 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      border: 1px solid #ccc;
      cursor: pointer;
    }
    img:hover {
      -webkit-box-shadow: 0 2px 6px 1px #c6cad1;
      box-shadow: 0 2px 6px 1px #c6cad1;
    }
  }
  .material {
    width: 100%;
  }
  .material.active {
    -webkit-box-shadow: 0 2px 6px 1px #c6cad1;
      box-shadow: 0 2px 6px 1px #c6cad1;
  }
}
</style>
