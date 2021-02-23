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
        <br>
        {{ item.size[0] * 1000 + ' X ' + item.size[1] * 1000 }}
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
          name: "油画1",
          url: "img/textures/1.jpeg",
          size: [0.512, 0.781],
          parentName: "floor",
        },
        {
          name: "油画2",
          url: "img/textures/2.jpeg",
          size: [0.512, 0.728],
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
        name: "选择油画",
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
