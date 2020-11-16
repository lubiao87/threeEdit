# Mars3D基础项目模版（含widget模块） - Vue版
 Vue技术栈下的一个具备基础widget功能的[Mars3D](http://cesium.marsgis.cn)应用的三维地球项目模版。
 这是一个基于 [VueCli](https://cli.vuejs.org/config/)并整合了Cesium、MarsGIS的基础项目。

 其他技术栈，请参考 [Mars3D开源导航](https://github.com/marsgis/MarsGIS-for-Cesium)




## 运行效果
 [在线Demo](http://cesium.marsgis.cn/project/simple-es5-widget/index.html)

 ![image](http://cesium.marsgis.cn/project/img/simple-es5-widget.jpg)

 [更多项目体验](http://cesium.marsgis.cn/project.html)



## 运行命令

### 首次运行前安装依赖
 `npm install` 或 `cnpm install`

### http运行项目
 `npm run serve`  运行后访问：`http://localhost:2001/`  。 修改代码自动热部署，无缓存不用手动刷新

### 打包编译项目
 运行`npm run build`来构建项目。


## 项目说明
1. 部分第三方库不是npm方式引入，是主页head中静态资源方式引入的。资源放在public目录下。
 主要原因是：
*     （1）一些第三方cesium插件并没有提供NPM包,以模块化的方式引入cesium没办法直接使用这些第三方插件包,通过静态资源的方式可以解决此问题。
*     （2）cesium库有不同版本，并且我们有汉化修复bug，直接引入npm的库没法使用。
2. public目录下文件与 Mars3D基础项目 的目录和文件完全相同，可以直接复制到该目录下进行更新。

3. public下面的widgets目录为之前传统js方式编写的一些widget模块，目前未重写为vue，当前为了兼容使用是静态引入的方式。
  新开发业务功能请在src目录下按vue方式去编写，不要使用原有的widget方式。

### 更新项目
 此脚手架中类库和widgets不保证是最新版本
 请您自行拷贝"基础项目"的 config、img、lib和widgets目录覆盖至当前项目的public目录下


### 与其他脚手架的区别
1. 与[mars3d-simple-vue](https://github.com/marsgis/mars3d-simple-vue)区别：
  比其多了widget模块部分，其他没区别



## 版权说明
  本项目主要是为了展示[Mars3D](http://cesium.marsgis.cn)的项目应用，仅限大家学习之用，如需用于商业项目，请联系购买[火星科技](http://cesium.marsgis.cn)SDK授权。
 并且Mars3D-SDK类库并未开源（即`libs/cesiumjs/okay3d/`）,在线演示版内部有作者公司logo及时效限制。