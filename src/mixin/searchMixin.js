/* eslint-disable */
import { mapState, mapGetters, mapActions } from "vuex"; //先要引入
// import { Message } from 'element-ui';

export const listSearch = {
  data: function() {
    return {
      Userdata: null,
      twoPoint: [],
    };
  },
  computed: {
    ...mapState({
      //这里的...是超引用，ES6的语法，意思是state里有多少属性值用户1可以在这里放多少属性值
      threePoints: (state) => state.collection.threePoints,
      dialogVisible: (state) => state.collection.dialogVisible,
      tagetName: (state) => state.collection.tagetName,
      grroveTool: (state) => state.collection.grroveTool,
      tagetColor: (state) => state.collection.tagetColor,
      grroveColor: (state) => state.collection.grroveColor,
      selectCasementMeth: (state) => state.collection.selectCasementMeth,
      //里面定义的threePoints是指footerStatus.js里state的threePoints
    }),
  },
  methods: {
    ...mapActions("collection", [
      //collection是指modules文件夹下的collection.js
      "Three_Points", //collection.js文件中的actions里的方法，在上面的@click中执行并传入实参
      "Set_DialogVisible",
      "Set_TagetName",
      "Set_SetGrroveTool",
      "Set_TagetColor",
      "Set_GrroveColor",
      "Set_SelectCasementMeth",
    ]),
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
    recoveryCameraPotion() {
      // 视角复原
      // if (this.controls) {
      //   this.controls.dispose();
      //   this.controls = null;
      // }
      this.controls.enabled = false;
      let curve = new THREE.CatmullRomCurve3([
        this.camera.position,
        this.clearPosition,
      ]);
      this.animatePoints = curve.getPoints(100); //分段数100，返回101个顶点
    },
    createResultMesh(srcMesh, destMesh, addDest) {
      var srcBSP = new ThreeBSP(srcMesh);
      var destBSP = new ThreeBSP(destMesh);
      var resultBSP = srcBSP.subtract(destBSP);
      var result = resultBSP.toMesh(srcMesh.material);
      result.geometry.computeFaceNormals();
      result.geometry.computeVertexNormals();
      if (addDest) {
        this.scene.add(destMesh);
      }

      return result;
    },
    paintGlass(data) {
      let options = {
        width: data.width || 1,
        length: data.length || 1,
        height: data.height || 1,
        x: data.x || 0,
        y: data.y || 0,
        z: data.z || 0,
        rotationX: data.rotationX || 0,
        rotationY: data.rotationY || 0,
        rotationZ: data.rotationZ || 0,
        addMesh: data.addMesh || false,
        color: data.color || "rgba(32, 76, 159, 0.6)",
        name: data.name || "",
      };
      if (options.color) {
        options.opacity = parseFloat(options.color.split(",")[3].split(")")[0]);
      } else {
        options.opacity = 0.6;
      }
      // console.log('options.opacity', options.opacity)
      var material = new THREE.MeshBasicMaterial({
        color: options.color,
        transparent: true,
        opacity: options.opacity,
      });

      //创建长方体几何体
      var gemotery = new THREE.BoxGeometry(1, 1, 1);
      // options.width,
      // options.length,
      // options.height
      //创建网格对象以及进行位置的设定
      var mesh = new THREE.Mesh(gemotery, material);
      mesh.name = options.name;
      mesh.typeName = "长方体";
      mesh.data = options;
      mesh.scale.set(options.length, options.height, options.width);
      mesh.position.set(options.x, options.y, options.z);

      mesh.rotation.z = (options.rotationZ * Math.PI) / 180;
      mesh.rotation.x = (options.rotationX * Math.PI) / 180;
      mesh.rotation.y = (options.rotationY * Math.PI) / 180;

      if (options.addMesh) {
        this.casementGroup.add(mesh);
      }
      console.log(mesh);
      return mesh;
    },
    addTexture() {
      let geometry = new THREE.PlaneGeometry(30, 30); //矩形平面
      let material = new THREE.MeshLambertMaterial({
        color: "#fff",
        side: THREE.DoubleSide, //两面可见
        transparent: true,
        opacity: 0,
      }); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      mesh.position.set(0, -0.01, 0);
      mesh.rotateX(Math.PI / 2);

      this.assistGroup.add(mesh);
      // this.scene.add(mesh); //网格模型添加到场景中
    },
    setIntersects(event, obj, callback) {
      let threeDom = document.getElementById("cesiumContainer");
      event.preventDefault();
      // console.log('offsetLeft', event)
      this.mouse.x =
        (event.offsetX / threeDom.getBoundingClientRect().width) * 2 - 1;
      this.mouse.y =
        -(event.offsetY / threeDom.getBoundingClientRect().height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      let intersects = this.raycaster.intersectObjects(obj, false);
      callback(intersects);
    },
    setOutlinePass() {
      let threeDom = document.getElementById("cesiumContainer");
      const that = this;
      // 创建一个渲染器通道，场景和相机作为参数
      this.renderPass = new THREE.RenderPass(this.scene, this.camera);
      // 创建OutlinePass通道,显示外轮廓边框
      // this.OutlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
      this.OutlinePass = new THREE.OutlinePass(
        new THREE.Vector2(
          threeDom.getBoundingClientRect().width,
          threeDom.getBoundingClientRect().height
        ),
        that.scene,
        that.camera
      );
      var effectCopy = new THREE.ShaderPass(THREE.CopyShader); //CopyShader是为了能将结果输出，普通的通道一般都是不能输出的，要靠CopyShader进行输出
      effectCopy.renderToScreen = true; //设置这个参数的目的是马上将当前的内容输出

      // 后处理完成，设置renderToScreen为true，后处理结果在Canvas画布上显示
      this.OutlinePass.renderToScreen = true;
      //OutlinePass相关属性设置
      this.OutlinePass.visibleEdgeColor = new THREE.Color("#f0f");
      this.OutlinePass.hiddenEdgeColor = new THREE.Color("#f0f");
      this.OutlinePass.edgeThickness = 1;
      this.OutlinePass.edgeStrength = 5;
      // 创建后处理对象EffectComposer，WebGL渲染器作为参数
      this.composer = new THREE.EffectComposer(this.renderer);
      // 设置renderPass通道
      this.composer.addPass(this.renderPass);
      // 设置OutlinePass通道
      this.composer.addPass(this.OutlinePass);
      // var FXAAShaderPass = new THREE.ShaderPass(THREE.FXAAShader);
      // FXAAShaderPass.renderToScreen = true;
      // FXAAShaderPass.uniforms["resolution"].value.set(
      //   1 / threeDom.getBoundingClientRect().width,
      //   1 / threeDom.getBoundingClientRect().height
      // );
      // console.log(
      //   threeDom.getBoundingClientRect().width,
      //   threeDom.getBoundingClientRect().height
      // )
      // this.composer.addPass(FXAAShaderPass);
    },
    setSelectedObjectsAdd(intersects, flag) {
      let mesh = intersects[0].object;
      if (this.OutlinePass.selectedObjects.length > 1) {
        this.OutlinePass.selectedObjects.splice(1, 1);
      }
      if (flag) {
        if (
          this.OutlinePass.selectedObjects[0] &&
          this.OutlinePass.selectedObjects[0].typeName === mesh.typeName
        ) {
          this.OutlinePass.selectedObjects = [];
        }
        this.OutlinePass.selectedObjects.push(mesh);
      } else {
        this.OutlinePass.selectedObjects = [mesh];
      }
      // console.log(this.OutlinePass.selectedObjects)
      this.scene.updateMatrixWorld(true);
      var worldPosition = new THREE.Vector3();
      mesh.getWorldPosition(worldPosition);
      return mesh;
    },
    addEventSelectCasementGrrove() {
      let threeDom = document.getElementById("cesiumContainer");
      threeDom.removeEventListener(
        "click",
        this.clickSelectCasementGrrove,
        false
      );
      threeDom.addEventListener("click", this.clickSelectCasementGrrove, false);
      threeDom.addEventListener(
        "mousemove",
        this.mousemoveSelectCasementGrrove,
        false
      );
    },
    remomveSelectCasementGrrove() {
      let threeDom = document.getElementById("cesiumContainer");
      threeDom.removeEventListener(
        "click",
        this.clickSelectCasementGrrove,
        false
      );
      threeDom.removeEventListener(
        "mousemove",
        this.mousemoveSelectCasementGrrove,
        false
      );
      threeDom.removeEventListener("click", this.clickSelectWall, false);
      threeDom.removeEventListener(
        "mousemove",
        this.mousemoveSelectWall,
        false
      );
    },
    setlName(val) {
      let date = new Date();
      let name =
        val +
        date.getFullYear() +
        (date.getMonth() + 1) +
        date.getDate() +
        date.getHours() +
        date.getMinutes() +
        date.getSeconds();
      return name;
    },
    addExhibitBox(option) {
      return new Promise(function(resolve, reject) {
        var geometry = new THREE.BoxGeometry(option.width, option.height, 0.01);
        var loader = new THREE.TextureLoader();
        loader.load(
          option.url,
          (texture) => {
            var materials = [
              new THREE.MeshBasicMaterial({ color: 0xffffff }), // right
              new THREE.MeshBasicMaterial({ color: 0xffffff }), // left
              new THREE.MeshBasicMaterial({ color: 0xffffff }), // top
              new THREE.MeshBasicMaterial({ color: 0xffffff }), // bottom
              new THREE.MeshBasicMaterial({ map: texture }), // back
              new THREE.MeshBasicMaterial({ map: texture }), // front
            ];
            var mesh = new THREE.Mesh(geometry, materials);
            mesh.name = option.name || "";
            mesh.position.set(0, option.height / 2, 0);
            resolve(mesh);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (xhr) => {
            reject(xhr);
          }
        );
      });
    },
    dragControlsEvent(obj) {
      if (this.transformControls) {
        this.transformControls.detach();
      }
      // 添加平移控件
      this.transformControls = new THREE.TransformControls(
        this.camera,
        this.renderer.domElement
      );
      this.scene.add(this.transformControls);
      // 初始化拖拽控件
      var dragControls = new THREE.DragControls(
        [obj],
        this.camera,
        this.renderer.domElement
      );
      this.transformControls.attach(obj);
      let threeDom = document.getElementById("cesiumContainer");

      // 开始拖拽
      dragControls.addEventListener("dragstart", (e) => {
        console.log(111);
        this.controls.enabled = false;

        threeDom.addEventListener(
          "mousemove",
          this.mousemoveSelectExhibit,
          false
        );
      });
      const that = this;
      // 拖拽结束
      dragControls.addEventListener("dragend", (event) => {
        console.log(222);
        this.controls.enabled = true;
        threeDom.removeEventListener(
          "mousemove",
          this.mousemoveSelectExhibit,
          false
        );
        this.transformControls.detach();
        dragControls.dispose();
      });
    },
    mousemoveSelectExhibit(e) {
      this.transformControls.update();
      this.setIntersects(e, this.WallGroup.children, (intersects) => {
        if (intersects.length > 0) {
          this.twoPoint.push(intersects[0].point);
          if (this.twoPoint.length > 2) {
            this.twoPoint.splice(0, 1);
          }
          if (this.twoPoint.length === 2) {
            let v1 = this.twoPoint[0];
            let v2 = this.twoPoint[1];
            let radina = this.getAngle(v1.x, v1.z, v2.x, v2.z);
            console.log(this.twoPoint, radina);
            this.selectExhibit.rotation.y = -radina;
            var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
            var vertices = new Float32Array([
              v1.x,
              v1.y,
              v1.z, //顶点1坐标
              v2.x,
              v2.y,
              v2.z, //顶点1坐标
            ]);

            // 创建属性缓冲区对象
            var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组
            // console.log(attribue);
            // 设置几何体attributes属性的位置position属性
            geometry.attributes.position = attribue;
            let material = new THREE.PointsMaterial({
              size: 0.1,
              sizeAttenuation: true,
              vertexColors: THREE.VertexColors,
            });
            var points = new THREE.Points(geometry, material);
            this.scene.add(points); //网格模型添加到场景中
          }
        }
      });
    },
    getAngle(VectorX1, VectorY1, VectorX2, VectorY2) {
      // var x = Math.abs(VectorX2 - VectorX1);
      // var y = Math.abs(VectorY2 - VectorY1);
      // var radius = Math.sqrt(Math.pow(x, 2.0) + Math.pow(y, 2.0));
      // var radina = y / radius;
      //获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
      var x = Math.abs(VectorX2 - VectorX1);
      var y = Math.abs(VectorY2 - VectorY1);
      var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      var cos = y / z;
      var radina = Math.acos(cos); //用反三角函数求弧度

      // if (VectorX2 > VectorX1 && VectorY2 > VectorY1) {
      //   //鼠标在第四象限
      //   radina = radina;
      // }

      // if (VectorX2 == VectorX1 && VectorY2 < VectorY1) {
      //   //鼠标在y轴负方向上
      //   radina = Math.PI;
      // }
      // if (VectorX2 == VectorX1 && VectorY2 > VectorY1) {
      //   //鼠标在y轴负方向上
      //   radina = 0;
      // }

      // if (VectorX2 > VectorX1 && VectorY2 == VectorY1) {
      //   //鼠标在x轴正方向上
      //   radina = Math.PI / 2;
      // }

      // if (VectorX2 < VectorX1 && VectorY2 > VectorY1) {
      //   //鼠标在第三象限
      //   radina = -radina;
      // }

      // if (VectorX2 < VectorX1 && VectorY2 == VectorY1) {
      //   //鼠标在x轴负方向
      //   radina = -Math.PI / 2;
      // }

      // if (VectorX2 < VectorX1 && VectorY2 < VectorY1) {
      //   //鼠标在第二象限
      //   radina = Math.PI + radina;
      // }
      // if (VectorX2 > VectorX1 && VectorY2 < VectorY1) {
      //   //鼠标在第一象限
      //   radina = Math.PI - radina;
      // }

      return radina ;
    },
  },

  // created() {
  //   this.getUserdata()
  // }
};
