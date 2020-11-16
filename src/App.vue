<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
@import "./assets/theme/base.css";
@import "./assets/theme/animate.min.css";
@import "./assets/common/iconfont/iconfont.css";
@import "@/assets/theme/common.scss";
html, body {
  width: 100%;
  min-width: 0 !important;
}
#app {
  width: 100%;
  height: 100%;
}

</style>
