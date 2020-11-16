<template>
  <div
    data-to-value="80"
    data-items-count="32"
    id="p1_barPie"
    class="barPie barPie--radio"
  >
    <span class="barPie__value">0</span>
    <div class="barPie__ring">
      <div v-for="count in 32"  class="barPie__ring__item" :key="count">
        <input
          type="radio"
          name="barPieRadioGroup"
          :id="'p1_barPieItem' + (32 - count)"
          :value="100 - (count - 1 ) * 3.125"
          hidden="hidden"
        />
        <label :for="'p1_barPieItem' + (32 - count)">
          <div></div>
          <div :class="{'gaoliang': djge > count - 1}"  :style="{background: colorArr[djge] || colorArr[31]}"></div>
        </label>
      </div>
        <div></div>
      </label>
    </div>
    <div class="circleProgress_wrapper">
      <div class="wrapper right">
        <div class="circleProgress rightcircle"></div>
      </div>
      <div class="wrapper left">
        <div class="circleProgress leftcircle"></div>
      </div>
      <div class="zhongxing"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "progressPage",
  props: {
    baifenbi: Number,
    required: true,
  },
  data: function () {
    return {
      baifenbij: 0,
      djge: 0,
      colorArr: []
    };
  },
  created(){
    const that = this;
    var startColor = "#ec9089";
    var endColor = "#c12927";
    this.colorArr = this.gradient(startColor, endColor, 32);
  },
  // mounted() {
  //   const that = this;
  //   var startColor = "#ec9089";
  //   var endColor = "#c12927";
  //   var step = 33;
  //   this.colorArr = this.gradient(startColor, endColor, 32);

  //   console.log("progressPage");
  // },
  watch: {
    baifenbi(val) {
      // console.log(val);
      this.percent(this.baifenbi);
      this.shuzi();
    },
  },
  methods: {
    rgbToHex(r, g, b) {
      var hex = ((r << 16) | (g << 8) | b).toString(16);
      return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
    },
    hexToRgb(hex) {
      var rgb = [];
      for (var i = 1; i < 7; i += 2) {
        rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
      }
      return rgb;
    },
    // 计算渐变过渡色
    gradient(startColor, endColor, step) {
      // 将 hex 转换为rgb
      var sColor = this.hexToRgb(startColor),
        eColor = this.hexToRgb(endColor);

      // 计算R\G\B每一步的差值
      let rStep = (eColor[0] - sColor[0]) / step;
      let gStep = (eColor[1] - sColor[1]) / step;
      let bStep = (eColor[2] - sColor[2]) / step;

      var gradientColorArr = [];
      for (var i = 0; i < step; i++) {
        // 计算每一步的hex值
        gradientColorArr.push(
          this.rgbToHex(
            parseInt(rStep * i + sColor[0]),
            parseInt(gStep * i + sColor[1]),
            parseInt(bStep * i + sColor[2])
          )
        );
      }
      return gradientColorArr;
    },
    //内圆圈动画
    percent(percent) {
      if (percent <= 50) {
        var xz = 45 + 3.6 * percent;
        $(".rightcircle").css("transform", "rotate(" + xz + "deg)");
      } else if (percent <= 100) {
        var xz = 45 + 3.6 * (percent - 50);
        $(".rightcircle").css("transform", "rotate(225deg)");
        $(".leftcircle").css("transform", "rotate(" + xz + "deg)");
      }
    },
    shuzi() {
      const that = this;
      // 设置每步动画计算的数值
      $(".barPie__value").text(Math.round((this.baifenbi * 100) / 100));
      this.djge = Math.floor(this.baifenbi / 3.125);
      // $("[for='p1_barPieItem" + this.djge + "']")
      //   .find("div")
      //   .addClass("gaoliang");
      // $("[for='p1_barPieItem" + this.djge + "']")
      //   .find("div")
      //   .css("background", that.colorArr[this.djge]);
      // console.log(this.djge);
    },
  },
};
</script>

<style lang="scss">
@import "../../assets/css/styles.css";
</style>