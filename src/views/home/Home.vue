<template>
  <div class="quanjing flexBox" id="quanjing-ststem">
    <div
      id="cesiumContainer"
      class="cesium-container"
      :style="{ cursor: cursorName }"
    ></div>
    <div class="hearder">
      <hearder />
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

import { ChangeSlowly } from "@/map/vrSphereAnimat";
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
  data: function(params) {
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
      clearPosition: new THREE.Vector3(0, 20, 0.1),
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
    console.log("this.controls", this.controls);
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
      this.controls = new THREE.OrbitControls(this.camera);
      // this.controls.target.set(0, 0, 0);
      // this.controls.update();

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
      // 坐标系辅助显示
      let axesHelper = new THREE.AxesHelper(10);
      this.scene.add(axesHelper);
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
      threeDom.appendChild(this.renderer.domElement);
      // this.addFloorTexture(); // 增加地板
      // this.addCircleGeometry(); // 增加vr点
      // this.addEventListenerFn(); // 绑定事件
      window.addEventListener("resize", this.onWindowResize, false);
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


          let mesh = intersects[0].object;
           this.OutlinePass.selectedObjects = [mesh];
          this.scene.updateMatrixWorld(true);
          var worldPosition = new THREE.Vector3();
          mesh.getWorldPosition(worldPosition)
          console.log(mesh,this.OutlinePass);
          // let threeDom = document.getElementById("cesiumContainer");
          // threeDom.removeEventListener(
          //   "mousemove",
          //   this.mousemoveSelectWall,
          //   false
          // );
        }
        // console.log(layerOpen)
      });
    },
    mousemoveSelectWall(event) {
      // 选择墙壁
      this.setIntersects(event, this.WallGroup.children, (intersects) => {
        if (intersects.length > 0) {

          this.cursorName = "pointer";
          let mesh = intersects[0].object;
          this.scene.remove(this.border);
          this.border = new THREE.BoxHelper(mesh, "#5b78e7"); //设置边框，这个边框不会旋转
          this.scene.add(this.border); //网格模型添加到场景中

        } else {
          this.cursorName = "auto";
          if (this.border) {
            this.scene.remove(this.border);
            this.border = null;
          }

          // this.OutlinePass.selectedObjects = [];
        }
      });
    },

    getChildData(data) {
      // console.log("获取chidren数据", data);
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
              threeDom3.removeEventListener("click", this.addSpritePoint, false);
            } else {
              this.$message.error('您还没有绘画墙轮廓呢');
            }
            
            break;
          case "确定墙轮廓":
            console.log("确定墙轮廓");
            this.cursorName = "auto";
            if (!this.controls) {
              this.controls = new THREE.OrbitControls(this.camera);
            }
            this.Three_Points(this.pointList);
            // this.pointList = [];
            let threeDom2 = document.getElementById("cesiumContainer");
            threeDom2.removeEventListener("click", this.addSpritePoint, false);
            break;
          case "选择地板":
            console.log("选择地板", data);
            this.newFloorTexture(data);
            break;
          case "增加窗口":
            console.log("增加窗口", data);
            let option = {
              width: data.data.casementSize.w,
              height: data.data.casementSize.h,
              depth: data.data.casementSize.l,
              addMesh: true,
              y: data.data.casementSize.l / 2,
            };
            console.log("option", option);
            this.casementMeth = this.paintGlass(option);
            break;
          case "确定窗户":
            console.log("确定窗户", data);
            this.cursorName = "auto";
            if (!this.controls) {
              this.controls = new THREE.OrbitControls(this.camera);
            }
            break;
          case "挖槽破窗":
            console.log("挖槽破窗", data);
            let threeDom4 = document.getElementById("cesiumContainer");
            threeDom4.removeEventListener("click", this.clickSelectWall, false);
            threeDom4.addEventListener("click", this.clickSelectWall, false);
            threeDom4.addEventListener(
              "mousemove",
              this.mousemoveSelectWall,
              false
            );
            this.cursorName = "auto";
            if (!this.controls) {
              this.controls = new THREE.OrbitControls(this.camera);
            }
            break;
          default:
            // if (!this.controls) {
            //   this.controls = new THREE.OrbitControls(this.camera);
            // }

            break;
        }
      }
    },
    newWallMesh(point) {
      // 创建墙体
      var shape = new THREE.Shape();
      /**四条直线绘制一个矩形轮廓*/
      shape.moveTo(0, 0.1); //起点
      shape.lineTo(-3, 0.1); //第2点
      shape.lineTo(-3, -0.1); //第3点
      shape.lineTo(0, -0.1); //第4点
      shape.lineTo(0, 0.1); //第5点
      /**创建轮廓的扫描轨迹(3D样条曲线)*/
      var curve = new THREE.SplineCurve3([
        this.pointList[this.pointList.length - 1],
        point,
      ]);
      var geometry = new THREE.ExtrudeGeometry( //拉伸造型
        shape, //二维轮廓
        //拉伸参数
        {
          bevelEnabled: false, //无倒角
          extrudePath: curve, //选择扫描轨迹
          // steps: this.pointList.length, //沿着路径细分数
        }
      );
      var material = new THREE.MeshPhongMaterial({
        color: "#666",
        side: THREE.DoubleSide, //两面可见
      }); //材质对象
      let wallMesh = new THREE.Mesh(geometry, material); //网格模型对象
      wallMesh.name = '墙壁' + this.pointList.length
      this.WallGroup.add(wallMesh);
    },
    newFloorTexture(data) {
      if (this.floorMesh) {
        this.scene.remove(this.floorMesh);
        this.floorMesh = null;
      }
      // 通过顶点定义轮廓
      let points = [];
      if(this.threePoints.length < 3) {
        this.$message.error('您还没有绘画墙轮廓呢');
        return;
      }
      this.threePoints.forEach((item) => {
        points.push(new THREE.Vector3(item.x, item.z, 1));
      });
      var shape = new THREE.Shape(points);
      console.log(points, this.threePoints);
      let geometry = new THREE.ShapeGeometry(shape, 25); //矩形平面
      // var geometry = new THREE.PlaneGeometry(20, 10); //矩形平面
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

      let material = new THREE.MeshLambertMaterial({
        // 设置纹理贴图：Texture对象作为材质map属性的属性值
        map: texture,
        side: THREE.DoubleSide, //两面可见
      }); //材质对象Material
      this.floorMesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      this.floorMesh.rotateX(Math.PI / 2);
      this.scene.add(this.floorMesh); //网格模型添加到场景中
    },
  },
  watch: {
    dialogVisible(val) {
      // 小窗口现实隐藏控制视角和控制
      console.log("dialogVisible", val);
      if (val) {
        this.recoveryCameraPotion();
      } else {
        if (!this.controls) {
          this.controls = new THREE.OrbitControls(this.camera);
        }
        this.cursorName = "auto";
      }
      let threeDom = document.getElementById("cesiumContainer");
      threeDom.removeEventListener("click", this.addSpritePoint, false);
    },
  },
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
}
</style>
