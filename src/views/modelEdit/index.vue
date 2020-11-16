<template>
  <div class="quanjing flexBox" id="quanjing-ststem">
    <div id="cesiumContainer" class="cesium-container"></div>
    <div id="photosphere" ref="photosphere" :style="{ 'pointer-events': photosphereShow }"></div>
    <div id="progressShow" ref="progressShow" v-show="baifenbiShow">
      <progress-page :baifenbi="baifenbi" />
    </div>
  </div>
</template>

<script>
import { ChangeSlowly } from "@/map/vrSphereAnimat";
import progressPage from "../../components/progress/progressPage";
export default {
  name: "index",
  components: {
    progressPage
  },
  data: function(params) {
    return {
      photosphereShow: "none",
      camera: null,
      renderer: null,
      scene: null,
      dataList: [],
      baifenbi: 0, // 进度条
      baifenbiShow: false,
      pointsIndex: 0,
      loockZ: 0
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
      let container = document.createElement("div");
      document.getElementById("cesiumContainer").appendChild(container);

      this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.25,
        100
      );
      this.camera.position.set(-4, 40, 10);
      // this.camera.lookAt(new THREE.Vector3(0, 0, 20));
      // this.camera.updateProjectionMatrix();
      this.controls = new THREE.OrbitControls(this.camera);
      this.controls.target.set(0, 0, 10);
      this.controls.update();

      // envmap
      var path = "textures/";
      var format = ".jpg";
      // var envMap = new THREE.CubeTextureLoader().load([
      //   path + "posx" + format,
      //   path + "negx" + format,
      //   path + "posy" + format,
      //   path + "negy" + format,
      //   path + "posz" + format,
      //   path + "negz" + format
      // ]);

      this.scene = new THREE.Scene();
      // this.scene.background = envMap;

      let light = new THREE.HemisphereLight("#fff"); // 光照
      light.position.set(2, 10, 2);
      this.scene.add(light);
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      // 坐标系辅助显示
      // var axesHelper = new THREE.AxesHelper(10);
      // this.scene.add(axesHelper);
      // model
      var loader = new THREE.GLTFLoader();
      this.listGroup = new THREE.Group();

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.gammaOutput = true;
      this.addCircleGeometry();
      that.baifenbiShow = true;
      loader.load(
        "http://59.110.26.156:888/skycesium-demo/building/building.gltf",
        gltf => {
          console.log(gltf);
          gltf.scene.rotateY(Math.PI / 12);
          gltf.scene.translateZ(15);
          gltf.scene.translateX(-5);
          this.scene.add(gltf.scene);
          this.scene.add(this.listGroup);
          this.addEventListenerFn();
        },
        onProgress => {
          // console.log(onProgress);
          that.baifenbi = parseFloat(
            ((onProgress.loaded / onProgress.total) * 100).toFixed(1)
          );
          if (that.baifenbi === 100) {
            setTimeout(() => {
              that.baifenbiShow = false;
            }, 400);
          }
        }
      );
      container.appendChild(this.renderer.domElement);
      window.addEventListener("resize", this.onWindowResize, false);
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    animate() {
      if (this.points) {
        if (this.pointsIndex < this.points.length - 1) {
          this.pointsIndex++;
          this.camera.position = this.points[this.pointsIndex];
        } else {
          this.points = null;
        }
        this.camera.lookAt(new THREE.Vector3(0, 1.5, this.loockZ));
        this.camera.updateProjectionMatrix();
      } else {
        this.pointsIndex = 0;
      }
      requestAnimationFrame(this.animate);

      this.renderer.render(this.scene, this.camera);
    },
    addCircleGeometry() {
      $.getJSON("./config/draw-demo.json", result => {
        for (let index = 0; index < result.features.length; index++) {
          this.dataList = result.features;
          const element = this.dataList[index];
          var geometry = new THREE.CylinderBufferGeometry(0.25, 0.3, 0.02, 32);
          var material = new THREE.MeshBasicMaterial({
            color: "#fff"
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

    addEventListenerFn() {
      document.addEventListener("mousemove", this.onMousemove, false);
      this.renderer.domElement.addEventListener(
        "click",
        this.onDocumentClick,
        false
      );
    },
    addGundong() {
      $(document.getElementById("photosphere")).bind(
        "mousewheel DOMMouseScroll",
        event => {
          //on也可以 bind监听
          //Chorme
          var wheel = event.originalEvent.wheelDelta;
          var detal = event.originalEvent.detail;
          if (event.originalEvent.wheelDelta) {
            //判断浏览器IE,谷歌滚轮事件
            if (wheel > 0) {
              //当滑轮向上滚动时
              console.log("上滚");
            }
            if (wheel < 0) {
              //当滑轮向下滚动时
              console.log("下滚");
              if (this.intersects) {
                // this.intersects = null;
                // this.wheelDomn();
              }
            }
          } else if (event.originalEvent.detail) {
            //Firefox滚轮事件
            if (detal > 0) {
              //当滑轮向下滚动时
              console.log("下滚1");
            }
            if (detal < 0) {
              //当滑轮向上滚动时
              console.log("上滚1");
              if (this.intersects) {
                // this.intersects = null;
                // this.wheelDomn();
              }
            }
          }
        }
      );
    },
    wheelDomn() {
      if (!this.points) {
        let curve = new THREE.CatmullRomCurve3([
          this.camera.position,
          new THREE.Vector3(-4, 40, 10)
        ]);
        this.points = curve.getPoints(100); //分段数100，返回101个顶点
        // this.controls = new THREE.OrbitControls(this.camera);
        this.controls.target.set(0, 0, 10);
        this.controls.update();
      }
    },
    onDocumentClick(event) {
      this.setIntersects(event, intersects => {
        // console.log(intersects);
        if (intersects.length > 0) {
          intersects[0].object.material.color.set("#0ff");
          this.intersects = intersects[0].object;
          var curve = new THREE.CatmullRomCurve3([
            this.camera.position,
            new THREE.Vector3(
              this.intersects.position.x,
              1.5,
              this.intersects.position.z
            )
          ]);
          if (this.intersects.position.z - this.camera.position.z > 0) {
            this.loockZ = this.intersects.position.z + 1;
          } else {
            this.loockZ = this.intersects.position.z - 1;
          }
          this.points = curve.getPoints(100); //分段数100，返回101个顶点
          // this.controls = new THREE.OrbitControls(this.camera);
          this.controls.target.set(this.intersects.position.x, 1.5, this.loockZ);
          this.controls.update();
          // console.log(this.points);
          // setTimeout(() => {

          // }, 200);
        } else {
          // this.intersects = null;
          this.listGroup.children.forEach(element => {
            element.material.color.set("#fff");
          });
        }
      });
      // console.log(this.listGroup.children, intersects)
    },
    onMousemove(event) {
      this.setIntersects(event, intersects => {
        // console.log(intersects)
        if (intersects.length > 0) {
          this.listGroup.children.forEach(element => {
            element.material.color.set("#fff");
          });
          document.getElementById("cesiumContainer").style.cursor = "pointer";
          intersects[0].object.material.color.set("#0ff");
        } else {
          document.getElementById("cesiumContainer").style.cursor = "inherit";
          if (!this.intersects) {
            this.listGroup.children.forEach(element => {
              element.material.color.set("#fff");
            });
          }
        }
      });
    },
    setIntersects(event, callback) {
      event.preventDefault();
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      let intersects = this.raycaster.intersectObjects(this.listGroup.children);
      callback(intersects);
    }
  },
  watch: {
    pointsIndex(val) {
      const that = this;
      if (val === 99 && this.intersects) {
        that.photosphereShow = "auto";
        let result = this.dataList;
        setTimeout(() => {
          var PSV = new PhotoSphereViewer.Viewer({
            container: "photosphere",
            panorama: result[this.intersects.indexN].vrurl,
            caption: result[this.intersects.indexN].desc,
            loadingImg: "img/photosphere-logo.gif",
            defaultLong: result[this.intersects.indexN].rotate
          });
          PSV.on("ready", (e, level) => {
            console.log(e, level);
          });
          PSV.on("zoom-updated", (e, level) => {
            console.log(level);
            if(level < 50) {
              PSV.destroy();
              that.photosphereShow = "none";
              that.$refs.photosphere.style.opacity = 0;
              that.intersects = null;
              that.wheelDomn();
            }
          });
        }, 400);

        console.log("开始vr");
        let data = {
          step: 0.05,
          sucess: params => {
            console.log("现实vr", params);
          }
        };
        that.baifenbi = 0;
        that.baifenbiShow = true;
        ChangeSlowly(data, params => {
          // console.log("params", params);
          that.baifenbi = parseFloat((params.site * 100).toFixed(1));
          if (that.baifenbi === 100) {
            setTimeout(() => {
              that.baifenbiShow = false;
              // that.addGundong();
            }, 400);
          }
          that.$refs.photosphere.style.opacity = params.site;
        });
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../../assets/theme/base.css";
@import "../../assets/common/iconfont/iconfont.css";
@import "@/assets/theme/common.scss";
#photosphere {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}
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
  .cesium-container {
    // width: 100%;
    height: 100%;
    color: #000;
  }
}
</style>
