<template>
  <div style="height: 100%;">
    <h1 class="logo outlinedA fn-pl20 float_L">
      okay3d
    </h1>
    <div class="navBar float_L">
        <ul>
            <li>
                新建
            </li>
            <li>
                跟换模板
            </li>
            <li>
                我的设计
            </li>
        </ul>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import "../../assets/css/font-style.css";

.logo {
  font-size: 30px;
//   padding-left: 24px;
  height: 100%;
  line-height: 54px;
  font-family: "YouYuan";
  width: 140px;
}
.navBar {
    margin-left: 20px;
    height: 100%;
    ul {
        height: 100%;
        li {
            height: 100%;
             display: block;
            float: left;
            color: #666;
            line-height: 60px;
            padding: 0 15px;
        }
        li:hover {
            color: #fff;
            background-color: #ff4555;
        }
    }
}
</style>
