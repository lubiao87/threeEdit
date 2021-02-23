<template>
  <div class="quanjing flexBox" id="quanjing-ststem">
    <div
      id="cesiumContainer"
      class="cesium-container"
      :style="{ cursor: cursorName }"
    ></div>
    <div class="hearder">
      <hearder>
        <div class="rt-button">
          <el-button class="button"><i class="el-icon-view"></i>预览</el-button>
          <el-button type="danger" class="button"
            ><i class="el-icon-folder-checked"></i>保存</el-button
          >
        </div>
      </hearder>
    </div>
    <div class="tool-bar">
      <leftPanel @getChildData="getChildData" />
    </div>
    <!-- <div id="progressShow" v-show="baifenbiShow">
      <progress-page :baifenbi="baifenbi" />
    </div> -->
  </div>
</template>

<script>
// import { Message } from 'element-ui';

// import { ChangeSlowly } from "@/map/vrSphereAnimat";
import progressPage from "@/components/progress/progressPage";
import hearder from "@/components/hearder/hearder";
import leftPanel from "@/components/leftPanel/leftPanel";

import { listSearchMixin } from "../../mixin"; //混淆请求

export default {
  mixins: [listSearchMixin],
  name: "index",
  components: {
    progressPage,
    hearder,
    leftPanel,
  },
  data: function (params) {
    return {
      photosphereShow: "none",
      camera: null,
      renderer: null,
      scene: null,
      dataList: [],
      baifenbi: 0, // 进度条 0 - 100
      baifenbiShow: false,
      pointsIndex: 0, // 视角线进度点
      assistGroup: null,
      clearPosition: new THREE.Vector3(0, 20, 0.2),
      pointList: [],
      cursorName: "default",
      // 创建通道,显示外轮廓边框
      OutlinePass: null,
      //效果合成器
      composer: null,
    };
  },
  mounted() {
    const that = this;
    // console.log(THREE);
    this.init();
    this.animate();
  },
  methods: {
    init() {
      const that = this;
      let threeDom = document.getElementById("cesiumContainer");

      this.camera = new THREE.PerspectiveCamera(
        45,
        threeDom.getBoundingClientRect().width /
          threeDom.getBoundingClientRect().height,
        1,
        1000
      );
      this.camera.position = new THREE.Vector3(10, 60, 20);
      // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.camera.updateProjectionMatrix();

      // envmap
      let path = "textures/background/";
      let format = ".jpg";
      let envMap = new THREE.CubeTextureLoader().load([
        path + "posx" + format,
        path + "negx" + format,
        path + "posy" + format,
        path + "negy" + format,
        path + "posz" + format,
        path + "negz" + format,
      ]);

      this.scene = new THREE.Scene();
      this.scene.background = envMap;
      //环境光
      var ambient = new THREE.AmbientLight(0x444444);
      this.scene.add(ambient);
      // let light = new THREE.HemisphereLight("#fff"); // 光照
      // light.position.set(2, 10, 2);
      // this.scene.add(light);
      //点光源
      var point = new THREE.PointLight("#fff");
      point.position.set(2, 10, 2); //点光源位置
      this.scene.add(point); //点光源添加到场景中

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      this.assistGroup = new THREE.Group();
      this.scene.add(this.assistGroup);
      this.points = new THREE.Group();
      this.scene.add(this.points);
      this.WallGroup = new THREE.Group(); // 墙体组合
      this.scene.add(this.WallGroup);
      this.casementGroup = new THREE.Group(); // 窗户组合
      this.scene.add(this.casementGroup);
      // model
      // let loader = new THREE.GLTFLoader();

      // 坐标系辅助显示
      let axesHelper = new THREE.AxesHelper(10);
      this.scene.add(axesHelper);
      var gridHelper = new THREE.GridHelper(30, 30);
      this.scene.add(gridHelper);
      this.addTexture();

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // this.renderer.setClearColor("#375e99", 1); //设置背景颜色
      this.renderer.setSize(
        threeDom.getBoundingClientRect().width,
        threeDom.getBoundingClientRect().height
      );
      this.renderer.gammaOutput = true;

      this.setOutlinePass();
      this.controls = new THREE.TrackballControls(
        this.camera,
        this.renderer.domElement
      );
      // 禁止拖动
      // this.controls.noPan = true;
      // 视角最小距离

      this.controls.minDistance = 10;
      // 视角最远距离
      this.controls.maxDistance = 1000;

      threeDom.appendChild(this.renderer.domElement);
      // this.addFloorTexture(); // 增加地板
      // this.addCircleGeometry(); // 增加vr点
      // this.addEventListenerFn(); // 绑定事件
      window.addEventListener("resize", this.onWindowResize, false);

      document
        .getElementById("cesiumContainer")
        .addEventListener("dblclick", (event) => {
          if(this.transformControls) {
            this.transformControls.detach();
          }
          
        });
    },

    animate() {
      if (this.animatePoints) {
        if (this.pointsIndex < this.animatePoints.length - 1) {
          this.pointsIndex++;
          this.camera.position = this.animatePoints[this.pointsIndex];
        } else {
          this.animatePoints = null;
        }
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();
      } else {
        this.pointsIndex = 0;
      }
      this.controls.update();
      this.controls.handleResize();
      this.composer.render();
      requestAnimationFrame(this.animate);

      // this.renderer.render(this.scene, this.camera);
    },
    addSpritePoint(event) {
      // 增加点
      this.setIntersects(event, this.assistGroup.children, (intersects) => {
        if (intersects.length > 0) {
          let point = intersects[0].point;
          if (this.pointList.length > 0) {
            console.log("增加点", point);
            this.newWallMesh(point);
          }

          this.pointList.push(point);
        }
        // console.log(layerOpen)
      });
    },
    clickSelectWall(event) {
      // 选择墙壁
      this.setIntersects(event, this.WallGroup.children, (intersects) => {
        if (intersects.length > 0) {
          this.wallMesh = this.setSelectedObjectsAdd(intersects, false);
          this.Set_TagetName(this.wallMesh.name);
          // console.log(this.wallMesh.material.color.getStyle());
          let color = this.wallMesh.material.color.getStyle();
          this.Set_TagetColor(color);
          let threeDom = document.getElementById("cesiumContainer");
          threeDom.removeEventListener(
            "mousemove",
            this.mousemoveSelectWall,
            false
          );
          this.cursorName = "auto";
        }
        // console.log(layerOpen)
      });
    },
    mousemoveSelectWall(event) {
      // 选择墙壁
      this.setIntersects(event, this.WallGroup.children, (intersects) => {
        if (intersects.length > 0) {
          this.cursorName = "pointer";
          this.setSelectedObjectsAdd(intersects, false);
        } else {
          this.cursorName = "auto";
        }
      });
    },
    clickSelectCasementGrrove(event) {
      // 点击选择窗户
      this.setIntersects(event, this.casementGroup.children, (intersects) => {
        let threeDom = document.getElementById("cesiumContainer");
        if (intersects.length > 0) {
          if (
            this.casementMeth &&
            this.casementMeth.name === intersects[0].object.name
          ) {
            this.casementMeth = null;
            this.OutlinePass.selectedObjects = [];
          } else {
            this.casementMeth = this.setSelectedObjectsAdd(intersects, true);
            this.Set_SetGrroveTool(this.casementMeth.name);
            let color = this.casementMeth.material.color.getStyle();
            this.Set_GrroveColor(color);
          }
          this.Set_SelectCasementMeth(this.casementMeth);
        }
        // console.log(layerOpen)
      });
    },
    mousemoveSelectCasementGrrove(event) {
      // 悬停窗户
      this.setIntersects(event, this.casementGroup.children, (intersects) => {
        if (intersects.length > 0) {
          this.cursorName = "pointer";
          if (!this.casementMeth) {
            this.setSelectedObjectsAdd(intersects, true);
          }
        } else {
          if (!this.selectCasementMeth) {
            this.OutlinePass.selectedObjects = [];
          }

          this.cursorName = "auto";
        }
        // console.log(intersects.length)
      });
    },
    getChildData(data) {
      // console.log("获取chidren数据", data);
      // 创建
      if (data.parentName) {
        switch (data.name) {
          case "绘画墙轮廓":
            this.cursorName = "crosshair";
            this.pointList = [];
            this.WallGroup.children = [];
            this.recoveryCameraPotion();
            let threeDom = document.getElementById("cesiumContainer");
            threeDom.removeEventListener("click", this.addSpritePoint, false);
            threeDom.addEventListener("click", this.addSpritePoint, false);
            break;
          case "闭合墙轮廓":
            console.log("闭合");
            this.cursorName = "auto";
            if (this.pointList.length > 1) {
              this.newWallMesh(this.pointList[0]);
              this.pointList.push(this.pointList[0]);
              let threeDom3 = document.getElementById("cesiumContainer");
              threeDom3.removeEventListener(
                "click",
                this.addSpritePoint,
                false
              );
            } else {
              this.$message.error("您还没有绘画墙轮廓呢");
            }
            this.controls.enabled = true;
            this.Three_Points(this.pointList);
            break;
          case "确定墙轮廓":
            console.log("确定墙轮廓");
            this.cursorName = "auto";
            this.controls.enabled = true;
            this.Three_Points(this.pointList);
            // this.pointList = [];
            let threeDom6 = document.getElementById("cesiumContainer");
            threeDom6.removeEventListener("click", this.addSpritePoint, false);
            break;
          case "取消墙轮廓":
            console.log("取消墙轮廓");
            this.cursorName = "auto";
            this.controls.enabled = true;
            let threeDom2 = document.getElementById("cesiumContainer");
            threeDom2.removeEventListener("click", this.addSpritePoint, false);
            break;
          case "增加墙":
            console.log("增加墙", data);
            this.cursorName = "auto";
            this.newWallQuadrilateral(data);

            break;
          case "选择地板":
            console.log("选择地板", data);
            this.newFloorTexture(data);
            break;
          case "增加窗户":
            console.log("增加窗户", data);
            let option = {
              width: data.data.casementSize.w,
              height: data.data.casementSize.h,
              length: data.data.casementSize.l,
              addMesh: true,
              // y: data.data.casementSize.l / 2 + data.data.casementPositon.y,
              y: data.data.casementPositon.y,
              x: data.data.casementPositon.x,
              z: data.data.casementPositon.z,
              rotationX: data.data.casementAngle.x,
              rotationY: data.data.casementAngle.y,
              rotationZ: data.data.casementAngle.z,
              color: data.data.casementColor,
              name: data.data.casementName,
            };
            // console.log("option", option);
            this.paintGlass(option);
            this.controls.enabled = true;

            this.cursorName = "auto";
            break;
          case "显示窗户信息":
            console.log("显示窗户信息", data);
            this.cursorName = "auto";
            this.addEventSelectCasementGrrove();
            break;
          case "修改窗户":
            console.log("修改窗户", data);
            // this.casementMeth = null;
            // this.Set_SelectCasementMeth(this.casementMeth);
            break;
          case "确定窗户":
            console.log("确定窗户", data);
            this.cursorName = "auto";
            this.controls.enabled = true;
            this.Set_DialogVisible(false);
            this.remomveSelectCasementGrrove();
            this.casementMeth = null;
            this.OutlinePass.selectedObjects = [];
            this.Set_SelectCasementMeth(this.casementMeth);

            break;
          case "挖槽破窗":
            console.log("挖槽破窗", data);
            let name = this.wallMesh.name;
            this.WallGroup.remove(this.wallMesh);

            this.wallMesh = this.createResultMesh(
              this.wallMesh,
              this.casementMeth,
              false
            );
            this.wallMesh.name = name;
            this.WallGroup.add(this.wallMesh);
            break;
          case "目标墙体":
            console.log("目标墙体", data);
            let threeDom4 = document.getElementById("cesiumContainer");
            threeDom4.removeEventListener("click", this.clickSelectWall, false);
            threeDom4.addEventListener("click", this.clickSelectWall, false);
            threeDom4.addEventListener(
              "mousemove",
              this.mousemoveSelectWall,
              false
            );
            this.cursorName = "auto";
            this.controls.enabled = true;
            break;
          case "槽具窗户":
            console.log("槽具窗户", data);
            this.casementMeth = null;
            this.controls.enabled = true;
            // this.addEventSelectCasementGrrove();
            this.cursorName = "auto";
            break;
          case "选择油画":
            console.log(data);
            this.addExhibitBox({
              width: data.data.size[0],
              height: data.data.size[1],
              url: data.data.url,
              name: data.data.name,
            }).then((obj) => {
              // this.selectExhibit = obj;
              this.scene.add(obj);
              this.dragControlsEvent(obj);
            });
            break;

          default:
            break;
        }
        if (data.modelWall === false) {
          console.log(data);
          var loader = new THREE.GLTFLoader();
          loader.load(
            data.data.modelurl,
            (gltf) => {
              console.log(gltf);
              gltf.scene.scale.set(10, 10, 10);
              gltf.scene.rotateY(Math.PI / 12);
              // gltf.scene.translateZ(15);
              // gltf.scene.translateX(-5);
              this.scene.add(gltf.scene);
            },
            (onProgress) => {
              console.log(onProgress);
            }
          );
        }
      }
      // 修改
      if (data.changeName) {
        switch (data.changeName) {
          case "修改窗户":
            if (this.casementMeth) {
              this.casementMeth[data.changeType][data.changeTaget] =
                data.changeData;
              this.casementMeth.data[data.changeDataValue] = data.changeData;
              console.log("修改窗户", data);
            }

            break;
          case "修改窗户颜色":
            if (this.casementMeth) {
              this.casementMeth[data.changeType][data.changeTaget].set(
                data.changeData
              );
              this.casementMeth[data.changeType].opacity = parseFloat(
                data.changeData.split(",")[3].split(")")[0]
              );
              this.casementMeth.data.color = data.changeData;
              this.casementMeth.data.opacity = parseFloat(
                data.changeData.split(",")[3].split(")")[0]
              );
              console.log("修改窗户颜色", data);
            }

            break;
          default:
            break;
        }
        this.Set_SelectCasementMeth(this.casementMeth);
      }
    },
    newWallMesh(point) {
      // 创建墙体
      var shape = new THREE.Shape();
      /**四条直线绘制一个矩形轮廓*/
      shape.moveTo(0, 0); //起点
      shape.lineTo(-3, 0); //第2点
      shape.lineTo(-3, -0.2); //第3点
      shape.lineTo(0, -0.2); //第4点
      shape.lineTo(0, 0); //第5点
      /**创建轮廓的扫描轨迹(3D样条曲线)*/
      var curve = new THREE.SplineCurve3([
        this.pointList[this.pointList.length - 1],
        point,
      ]);

      var textureLoader = new THREE.TextureLoader();
      // // 加载纹理贴图
      var texture = textureLoader.load("./img/wall/diffuse.jpg");
      // 加载凹凸贴图
      var textureBump = textureLoader.load("./img/wall/bump.jpg");

      // 设置阵列模式   默认ClampToEdgeWrapping  RepeatWrapping：阵列  镜像阵列：MirroredRepeatWrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // uv两个方向纹理重复数量
      texture.repeat.set(1, 1);

      var geometry = new THREE.ExtrudeGeometry( //拉伸造型
        shape, //二维轮廓
        {
          bevelEnabled: false, //无倒角
          extrudePath: curve, //选择扫描轨迹
          // steps: this.pointList.length, //沿着路径细分数
        }
      );
      var material = new THREE.MeshPhongMaterial({
        color: "#666",
      }); //材质对象

      let wallMesh = new THREE.Mesh(geometry, material); //网格模型对象
      wallMesh.name = "墙壁" + this.pointList.length;
      this.WallGroup.add(wallMesh);
    },
    newFloorTexture(data) {
      if (this.floorMesh) {
        this.scene.remove(this.floorMesh);
        this.floorMesh = null;
      }
      // 通过顶点定义轮廓
      let points = [];
      if (this.threePoints.length < 3) {
        this.$message.error("您还没有绘画墙轮廓呢");
        return;
      }
      this.threePoints.forEach((item) => {
        points.push(new THREE.Vector3(item.x, item.z, 1));
      });
      var shape = new THREE.Shape(points);
      // console.log(points, this.threePoints);
      // let geometry = new THREE.ShapeGeometry(shape, 25); //矩形平面
      var geometry = new THREE.ExtrudeGeometry( //拉伸造型
        shape, //二维轮廓
        //拉伸参数
        {
          amount: -0.05, //拉伸长度
          bevelEnabled: false, //无倒角
        }
      );
      // TextureLoader创建一个纹理加载器对象，可以加载图片作为几何体纹理
      let textureLoader = new THREE.TextureLoader();
      // 执行load方法，加载纹理贴图成功后，返回一个threejs对象Texture
      let texture = textureLoader.load(data.data.url);

      // 设置阵列模式   默认ClampToEdgeWrapping  RepeatWrapping：阵列  镜像阵列：MirroredRepeatWrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // uv两个方向纹理重复数量
      texture.repeat.set(1, 1);
      // 偏移效果
      // texture.offset = new THREE.Vector2(0.5, 0.5)

      // let material = new THREE.MeshLambertMaterial({
      //   // 设置纹理贴图：Texture对象作为材质map属性的属性值
      //   map: texture,
      //   side: THREE.DoubleSide, //两面可见
      // }); //材质对象Material
      let materials = [
        //下标0：右面材质
        new THREE.MeshBasicMaterial({
          map: texture,
        }),
        new THREE.MeshBasicMaterial({
          color: "#ccc", //三角面颜色
        }),
        new THREE.MeshBasicMaterial({
          color: "#ccc", //三角面颜色
        }),
        new THREE.MeshBasicMaterial({
          color: "#ccc", //三角面颜色
        }),
        new THREE.MeshBasicMaterial({
          color: "#ccc", //三角面颜色
        }),
        new THREE.MeshBasicMaterial({
          color: "#ccc", //三角面颜色
        }),
      ];
      this.floorMesh = new THREE.Mesh(geometry, materials); //网格模型对象Mesh
      this.floorMesh.rotateX(Math.PI / 2);
      this.scene.add(this.floorMesh); //网格模型添加到场景中
    },
    newWallQuadrilateral(data) {
      // 矩形嵌套矩形或圆弧
      var shape = new THREE.Shape(); //Shape对象
      //外轮廓
      shape.moveTo(0 - data.drawSizeL / 2, 0 - data.drawSizeW / 2); //起点
      shape.lineTo(0 - data.drawSizeL / 2, data.drawSizeW - data.drawSizeW / 2); //第2点
      shape.lineTo(
        data.drawSizeL - data.drawSizeL / 2,
        data.drawSizeW - data.drawSizeW / 2
      ); //第3点
      shape.lineTo(data.drawSizeL - data.drawSizeL / 2, 0 - data.drawSizeW / 2); //第4点
      shape.lineTo(0 - data.drawSizeL / 2, 0 - data.drawSizeW / 2); //第5点
      //
      //内轮廓
      var path = new THREE.Path(); //path对象
      //  path.arc(50,50,40,0,2*Math.PI);//圆弧
      path.moveTo(
        data.drawSizeT - data.drawSizeL / 2,
        data.drawSizeT - data.drawSizeW / 2
      ); //起点
      path.lineTo(
        data.drawSizeT - data.drawSizeL / 2,
        data.drawSizeW - data.drawSizeT - data.drawSizeW / 2
      ); //第2点
      path.lineTo(
        data.drawSizeL - data.drawSizeT - data.drawSizeL / 2,
        data.drawSizeW - data.drawSizeT - data.drawSizeW / 2
      ); //第3点
      path.lineTo(
        data.drawSizeL - data.drawSizeT - data.drawSizeL / 2,
        data.drawSizeT - data.drawSizeW / 2
      ); //第4点
      path.lineTo(
        data.drawSizeT - data.drawSizeL / 2,
        data.drawSizeT - data.drawSizeW / 2
      ); //第5点
      shape.holes.push(path); //设置内轮廓

      var geometry = new THREE.ExtrudeGeometry( //拉伸造型
        shape, //二维轮廓
        //拉伸参数
        {
          amount: data.drawSizeH, //拉伸长度
          curveSegments: 40, //圆周方向细分数
          bevelEnabled: false, //无倒角
        }
      );
      var material = new THREE.MeshPhongMaterial({
        color: data.wallColor,
        side: THREE.DoubleSide, //两面可见
        transparent: true,
        opacity: parseFloat(data.wallColor.split(",")[3].split(")")[0]),
      }); //材质对象
      var mesh = new THREE.Mesh(geometry, material); //网格模型对象
      mesh.rotateX(-Math.PI / 2);
      this.WallGroup.children = [];
      mesh.name = "四边形墙体";
      this.WallGroup.add(mesh); //网格模型添加到场景中
    },
  },
  // watch: {
  //   casementMeth(val) {
  //     // 小窗口现实隐藏控制视角和控制
  //     console.log("casementMeth", val);
  //     this.Set_SelectCasementMeth(val);
  //   },
  // },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "@/assets/theme/option.scss";
#progressShow {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
  // pointer-events: none;
  // background: #3c3b52;
  background-image: -webkit-radial-gradient(
    top,
    circle cover,
    #3c3b52 0%,
    #252233 80%
  );
  background-image: -moz-radial-gradient(
    top,
    circle cover,
    #3c3b52 0%,
    #252233 80%
  );
  background-image: -o-radial-gradient(
    top,
    circle cover,
    #3c3b52 0%,
    #252233 80%
  );
  background-image: radial-gradient(
    circle cover at top,
    #3c3b52 0%,
    #252233 80%
  );
}
.quanjing {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .hearder {
    height: 60px;
    width: 100%;
    background-color: #fff;
    z-index: 1;
    border-bottom: 0 solid #ff7671;
    box-shadow: 0 2px 4px hsla(0, 0%, 88.2%, 0.5);
  }
  .tool-bar {
    width: 80px;
    flex: 1;
    z-index: 1;
    box-shadow: -5px 0 5px -5px #cecece;
    background: $bodyBgColor;
    border-right: 1px solid $bodyBgColor;
  }
  .cesium-container {
    position: absolute;
    right: 0;
    bottom: 0;
    width: calc(100% - 80px);
    height: calc(100% - 60px);
    color: #000;
  }
  .rt-button {
    height: 100%;
    float: right;
    .button {
      height: 100%;
      border: 0px solid;
      border-radius: 0;
      width: 100px;
      padding: 0;
      i {
        margin-right: 4px;
      }
    }
  }
}
</style>
