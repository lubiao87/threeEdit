/* eslint-disable */
import { mapState, mapGetters, mapActions } from 'vuex' //先要引入
// import { Message } from 'element-ui';

export const listSearch = {
  data: function() {
    return {
      Userdata: null,
    }
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
    ...mapActions('collection', [
      //collection是指modules文件夹下的collection.js
      'Three_Points', //collection.js文件中的actions里的方法，在上面的@click中执行并传入实参
      'Set_DialogVisible',
      'Set_TagetName',
      'Set_SetGrroveTool',
      'Set_TagetColor',
      'Set_GrroveColor',
      'Set_SelectCasementMeth',
    ]),
    onWindowResize() {
      let threeDom = document.getElementById('cesiumContainer')
      this.camera.aspect =
        threeDom.getBoundingClientRect().width /
        threeDom.getBoundingClientRect().height
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(
        threeDom.getBoundingClientRect().width,
        threeDom.getBoundingClientRect().height
      )
    },
    recoveryCameraPotion() {
      // 视角复原
      if (this.controls) {
        this.controls.dispose()
        this.controls = null
      }
      let curve = new THREE.CatmullRomCurve3([
        this.camera.position,
        this.clearPosition,
      ])
      this.animatePoints = curve.getPoints(100) //分段数100，返回101个顶点
    },
    createResultMesh(srcMesh, destMesh, addDest) {
      var srcBSP = new ThreeBSP(srcMesh)
      var destBSP = new ThreeBSP(destMesh)
      var resultBSP = srcBSP.subtract(destBSP)
      var result = resultBSP.toMesh(srcMesh.material)
      result.geometry.computeFaceNormals()
      result.geometry.computeVertexNormals()
      if (addDest) {
        this.scene.add(destMesh)
      }

      return result
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
        color: data.color || 'rgba(32, 76, 159, 0.6)',
        name: data.name || '',
      }
      if (options.color) {
        options.opacity = parseFloat(options.color.split(',')[3].split(')')[0])
      } else {
        options.opacity = 0.6
      }
      // console.log('options.opacity', options.opacity)
      var material = new THREE.MeshBasicMaterial({
        color: options.color,
        transparent: true,
        opacity: options.opacity,
      })

      //创建长方体几何体
      var gemotery = new THREE.BoxGeometry(1, 1, 1)
      // options.width,
      // options.length,
      // options.height
      //创建网格对象以及进行位置的设定
      var mesh = new THREE.Mesh(gemotery, material)
      mesh.name = options.name
      mesh.typeName = '长方体'
      mesh.data = options;
      mesh.scale.set(options.length, options.height, options.width)
      mesh.position.set(options.x, options.y, options.z)

      mesh.rotation.z = (options.rotationZ * Math.PI) / 180
      mesh.rotation.x = (options.rotationX * Math.PI) / 180
      mesh.rotation.y = (options.rotationY * Math.PI) / 180

      if (options.addMesh) {
        this.casementGroup.add(mesh)
      }

      return mesh
    },
    addTexture() {
      let geometry = new THREE.PlaneGeometry(30, 30) //矩形平面
      let material = new THREE.MeshLambertMaterial({
        color: '#fff',
        side: THREE.DoubleSide, //两面可见
        transparent: true,
        opacity:0,
      }) //材质对象Material
      let mesh = new THREE.Mesh(geometry, material) //网格模型对象Mesh
      mesh.position.set(0, -0.01, 0)
      mesh.rotateX(Math.PI / 2)

      this.assistGroup.add(mesh)
      // this.scene.add(mesh); //网格模型添加到场景中
    },
    setIntersects(event, obj, callback) {
      let threeDom = document.getElementById('cesiumContainer')
      event.preventDefault()
      // console.log('offsetLeft', event)
      this.mouse.x =
        (event.offsetX / threeDom.getBoundingClientRect().width) * 2 - 1
      this.mouse.y =
        -(event.offsetY / threeDom.getBoundingClientRect().height) * 2 + 1
      this.raycaster.setFromCamera(this.mouse, this.camera)

      let intersects = this.raycaster.intersectObjects(obj, true)
      callback(intersects)
    },
    setOutlinePass() {
      let threeDom = document.getElementById('cesiumContainer')
      const that = this
      // 创建一个渲染器通道，场景和相机作为参数
      this.renderPass = new THREE.RenderPass(this.scene, this.camera)
      // 创建OutlinePass通道,显示外轮廓边框
      // this.OutlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
      this.OutlinePass = new THREE.OutlinePass(
        new THREE.Vector2(
          threeDom.getBoundingClientRect().width,
          threeDom.getBoundingClientRect().height
        ),
        that.scene,
        that.camera
      )
      var effectCopy = new THREE.ShaderPass(THREE.CopyShader) //CopyShader是为了能将结果输出，普通的通道一般都是不能输出的，要靠CopyShader进行输出
      effectCopy.renderToScreen = true //设置这个参数的目的是马上将当前的内容输出

      // 后处理完成，设置renderToScreen为true，后处理结果在Canvas画布上显示
      this.OutlinePass.renderToScreen = true
      //OutlinePass相关属性设置
      this.OutlinePass.visibleEdgeColor = new THREE.Color('#f0f')
      this.OutlinePass.hiddenEdgeColor = new THREE.Color('#f0f')
      this.OutlinePass.edgeThickness = 1
      this.OutlinePass.edgeStrength = 5
      // 创建后处理对象EffectComposer，WebGL渲染器作为参数
      this.composer = new THREE.EffectComposer(this.renderer)
      // 设置renderPass通道
      this.composer.addPass(this.renderPass)
      // 设置OutlinePass通道
      this.composer.addPass(this.OutlinePass)
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
      let mesh = intersects[0].object
      if (this.OutlinePass.selectedObjects.length > 1) {
        this.OutlinePass.selectedObjects.splice(1, 1)
        
      }
      if (flag) {
        if(this.OutlinePass.selectedObjects[0] && this.OutlinePass.selectedObjects[0].typeName === mesh.typeName) {
          this.OutlinePass.selectedObjects = [];
        } 
        this.OutlinePass.selectedObjects.push(mesh)
      } else {
        this.OutlinePass.selectedObjects = [mesh];
      }
      // console.log(this.OutlinePass.selectedObjects)
      this.scene.updateMatrixWorld(true)
      var worldPosition = new THREE.Vector3()
      mesh.getWorldPosition(worldPosition)
      return mesh
    },
    addEventSelectCasementGrrove() {
      let threeDom = document.getElementById('cesiumContainer')
      threeDom.removeEventListener(
        'click',
        this.clickSelectCasementGrrove,
        false
      )
      threeDom.addEventListener('click', this.clickSelectCasementGrrove, false)
      threeDom.addEventListener(
        'mousemove',
        this.mousemoveSelectCasementGrrove,
        false
      )
    },
    remomveSelectCasementGrrove() {
      let threeDom = document.getElementById('cesiumContainer')
      threeDom.removeEventListener(
        'click',
        this.clickSelectCasementGrrove,
        false
      )
      threeDom.removeEventListener(
        'mousemove',
        this.mousemoveSelectCasementGrrove,
        false
      )
      threeDom.removeEventListener("click", this.clickSelectWall, false);
      threeDom.removeEventListener("mousemove", this.mousemoveSelectWall, false);
    },
  },

  // created() {
  //   this.getUserdata()
  // }
}
