<template>
  <div class="floorPanel">
    <slot name="header"></slot>
    <div
      v-for="(item, index) in data"
      :key="index"
      class="item float_L"
      @click="imgClick(item, index)"
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
  </div>
</template>

<script>
export default {
  // props: {
  //   data: {
  //     type: Array,
  //     default: [], //默认值
  //   },
  // },
  data: () => {
    return {
      activeIndex: -1,
      data: [
        {
          name: "1x1太阳能板",
          url: "img/floor/t1.png",
          size: [1, 1],
          parentName: "floor",
        },
        {
          name: "1x1红点瓷板",
          url: "img/floor/t2.png",
          size: [1, 1],
          parentName: "floor",
        },
        {
          name: "1x1黑白格",
          url: "img/floor/t3.jpg",
          size: [1, 1],
          parentName: "floor",
        },
      ],
    };
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
        data: data,
      };
      this.$emit("getChildData", this.parendData);
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/theme/option.scss";
@import "@/assets/theme/leftPanel.scss";

.floorPanel {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
}
</style>
