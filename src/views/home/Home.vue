<template>
  <div class="quanjing flexBox" id="quanjing-ststem">
    <div id="cesiumContainer" class="cesium-container"></div>
    <div class="hearder">
      <hearder />
    </div>
    <div class="tool-bar">
      <leftPanel @getChildData="getChildData" />
    </div>
    <div id="progressShow" v-show="baifenbiShow">
      <progress-page :baifenbi="baifenbi" />
    </div>
  </div>
</template>

<script>
import { ChangeSlowly } from "@/map/vrSphereAnimat";
import progressPage from "@/components/progress/progressPage";
import hearder from "@/components/hearder/hearder";
import leftPanel from "@/components/leftPanel/leftPanel";

export default {
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
      listGroup: null,
      clearPosition: new THREE.Vector3(0, 30, -0.1),
      childrenName: null
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
        0.25,
        100
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

      let light = new THREE.HemisphereLight("#fff"); // 光照
      light.position.set(2, 10, 2);
      this.scene.add(light);
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      // 坐标系辅助显示
      let axesHelper = new THREE.AxesHelper(10);
      this.scene.add(axesHelper);

      // model
      // let loader = new THREE.GLTFLoader();

      this.addTexture();
      this.listGroup = new THREE.Group();
      this.scene.add(this.listGroup);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // this.renderer.setClearColor("#375e99", 1); //设置背景颜色
      this.renderer.setSize(
        threeDom.getBoundingClientRect().width,
        threeDom.getBoundingClientRect().height
      );
      this.renderer.gammaOutput = true;

      threeDom.appendChild(this.renderer.domElement);
      // this.addFloorTexture(); // 增加地板
      // this.addCircleGeometry(); // 增加vr点
      // this.addEventListenerFn(); // 绑定事件
      window.addEventListener("resize", this.onWindowResize, false);
    },
    onWindowResize() {
      let threeDom = document.getElementById("cesiumContainer");
      this.camera.aspect =
        threeDom.getBoundingClientRect().width /
        threeDom.getBoundingClientRect().height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(
        threeDom.getBoundingClientRect().width,
        threeDom.getBoundingClientRect().height
      );
    },
    animate() {
      if (this.points) {
        if (this.pointsIndex < this.points.length - 1) {
          this.pointsIndex++;
          this.camera.position = this.points[this.pointsIndex];
        } else {
          this.points = null;
        }
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();
      } else {
        this.pointsIndex = 0;
      }
      requestAnimationFrame(this.animate);

      this.renderer.render(this.scene, this.camera);
    },

    addEventListenerFn() {
      let threeDom = document.getElementById("cesiumContainer");
      threeDom.addEventListener("mousemove", this.onMousemove, false);
      threeDom.addEventListener("click", this.onDocumentClick, false);
    },
    onDocumentClick(event) {
      this.setIntersects(event, (intersects) => {
        console.log(intersects);
        if (intersects.length > 0) {
          intersects[0].object.material.color.set("#0ff");
          this.intersects = intersects[0].object;
          let curve = new THREE.CatmullRomCurve3([
            this.camera.position,
            new THREE.Vector3(
              this.intersects.position.x,
              1.5,
              this.intersects.position.z
            ),
          ]);
          this.points = curve.getPoints(100); //分段数100，返回101个顶点
          // setTimeout(() => {

          // }, 200);
        } else {
          // this.intersects = null;
          this.listGroup.children.forEach((element) => {
            element.material.color.set("#fff");
          });
        }
      });
      // console.log(this.listGroup.children, intersects)
    },
    onMousemove(event) {
      this.setIntersects(event, (intersects) => {
        // console.log(intersects)
        if (intersects.length > 0) {
          this.listGroup.children.forEach((element) => {
            element.material.color.set("#fff");
          });
          document.getElementById("cesiumContainer").style.cursor = "pointer";
          intersects[0].object.material.color.set("#0ff");
        } else {
          document.getElementById("cesiumContainer").style.cursor = "inherit";
          if (!this.intersects) {
            this.listGroup.children.forEach((element) => {
              element.material.color.set("#fff");
            });
          }
        }
      });
    },
    setIntersects(event, callback) {
      let threeDom = document.getElementById("cesiumContainer");
      event.preventDefault();
      // console.log('offsetLeft', event)
      this.mouse.x =
        (event.offsetX / threeDom.getBoundingClientRect().width) * 2 - 1;
      this.mouse.y =
        -(event.offsetY / threeDom.getBoundingClientRect().height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      let intersects = this.raycaster.intersectObjects(this.listGroup.children);
      callback(intersects);
    },
    addTexture() {
      let geometry = new THREE.PlaneGeometry(30, 20); //矩形平面
      let material = new THREE.MeshLambertMaterial({
        color: "#ccc",
        side: THREE.DoubleSide, //两面可见
      }); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      mesh.rotateX(Math.PI / 2);
      this.scene.add(mesh); //网格模型添加到场景中
    },
    addFloorTexture() {
      let geometry = new THREE.PlaneGeometry(20, 10); //矩形平面

      // TextureLoader创建一个纹理加载器对象，可以加载图片作为几何体纹理
      let textureLoader = new THREE.TextureLoader();
      // 执行load方法，加载纹理贴图成功后，返回一个threejs对象Texture
      let texture = textureLoader.load("img/floor/t1.png");

      // 设置阵列模式   默认ClampToEdgeWrapping  RepeatWrapping：阵列  镜像阵列：MirroredRepeatWrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // uv两个方向纹理重复数量
      texture.repeat.set(20, 10);
      // 偏移效果
      // texture.offset = new THREE.Vector2(0.5, 0.5)

      let material = new THREE.MeshLambertMaterial({
        // 设置纹理贴图：Texture对象作为材质map属性的属性值
        map: texture,
        side: THREE.DoubleSide, //两面可见
      }); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      mesh.rotateX(Math.PI / 2);
      this.scene.add(mesh); //网格模型添加到场景中
    },
    addCircleGeometry() {
      $.getJSON("./config/draw-demo.json", (result) => {
        for (let index = 0; index < result.features.length; index++) {
          this.dataList = result.features;
          const element = this.dataList[index];
          var geometry = new THREE.CylinderBufferGeometry(0.25, 0.3, 0.02, 32);
          var material = new THREE.MeshBasicMaterial({
            color: "#fff",
            // side: THREE.DoubleSide, //两面可见
          });
          var circle = new THREE.Mesh(geometry, material);
          circle.name = element.properties.name;
          circle.indexN = element.index;
          circle.position.set(
            element.position[0],
            element.position[1],
            element.position[2]
          ); //点光源位置
          // circle.rotateX(Math.PI / 2);
          this.listGroup.add(circle);
        }
      });

      // this.scene.add( this.listGroup );
    },
    getChildData(data) {
      console.log("获取chidren数据", data);
      if (data.parentName) {
        
        switch (data.name) {
          case "绘画墙轮廓":
            // if(this.childrenName !== data.name) {
              if (this.controls) {
                this.controls.dispose();
                this.controls = null;
              }
              let curve = new THREE.CatmullRomCurve3([
                this.camera.position,
                this.clearPosition
              ]);
              this.points = curve.getPoints(100); //分段数100，返回101个顶点
            // }
            
            break;
          default:
            if (!this.controls) {
                this.controls = new THREE.OrbitControls(this.camera);
              }
            
            break;
        }
        this.childrenName = data.name;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
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
    background: #f1f3f7;
    border-right: 1px solid #f1f3f7;
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
