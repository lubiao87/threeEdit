// import * as Cesium from 'cesium/Cesium'
// import * as okay3d from '@/map/okay3d/okay3d' // 3-22版mar3d
// import { loadCesiumZH } from '@/map/plugins/class/cesium-zh'

// 环绕旋转
export function startRaodian() {
  stopRaodian()
  var point = okay3d.point.getCenter(viewer)
  okay3d.point.windingPoint.start(viewer, point)
}
export function stopRaodian() {
  // if (lastModel) {
  //     viewer.entities.remove(lastModel);
  //     lastModel = null;
  // }
  okay3d.point.windingPoint.stop()
}
// var arrPoint = []

export function drawTextPoint(html, data, callback) {
  // viewer.mars.draw.deleteAll()
  var position = Cesium.Cartesian3.fromDegrees(data.X, data.Y, data.Z)
  var divpoint2 = new okay3d.DivPoint(viewer, {
    html: html,
    anchor: [0, 0],
    position: position,
    // oldver:true,
    // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 100000), //按视距距离显示
    scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 10000, 0.2),
    click: function (e) {
      //单击后的回调
      console.log(e)
    },
  })
  // debugger
  // divpoint2._depthTest =false;
  if (callback) {
    callback(divpoint2)
  }
}
// 删除文字标签
export function deletTextPoint(obj) {
  console.log(obj)
  viewer.mars.draw.remove(obj)
}

//相机移动后
export function setMoveEnd(callback) {
  viewer.scene.camera.moveEnd.addEventListener(callback)
}

// 增加点
// var dataSource = new Cesium.CustomDataSource();
export function addFeature(item) {
  var dataSource = new Cesium.CustomDataSource()

  // for (var i = 0, len = arr.length; i < len; i++) {
  // var item = arr[i];

  var inthtml = `<table style="width: 200px;"><tr>
    <th scope="col" colspan="4"  style="text-align:center;font-size:15px;">
    ${item.name}
    </th></tr><tr>
    <td >住用单位：</td><td >${item.zydw}</td></tr><tr>
    <td >建筑面积：</td><td >${item.jzmj}</td></tr><tr>
    <td >建筑层数：</td><td >${item.jzcs}</td></tr><tr>
    <td >建筑结构：</td><td >${item.jzjg}</td></tr><tr>
    <td >建筑年份：</td><td >${item.jzlf}</td></tr><tr>
    <td colspan="4" style="text-align:right;"><a href="javascript:;">更多</a></td></tr></table>`

  //添加实体
  var entitie = dataSource.entities.add({
    name: item.name,
    position: Cesium.Cartesian3.fromDegrees(item.X, item.Y, 10),
    point: {
      color: new Cesium.Color.fromCssColorString('#3388ff'),
      pixelSize: 10,
      outlineColor: new Cesium.Color.fromCssColorString('#ffffff'),
      outlineWidth: 2,
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.2),
    },
    label: {
      text: item.name,
      font: 'normal small-caps normal 17px 楷体',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.AZURE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -20), //偏移量
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0.0,
        2000000
      ),
    },
    data: item,
    tooltip: {
      html: inthtml,
      anchor: [0, -12],
    },
    click: function (entity) {
      //单击
      if (viewer.camera.positionCartographic.height > 1000) {
        viewer.flyTo(entity, {
          offset: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-90),
            range: 1000,
          },
        })
      }
      // viewer.dataSources.remove(dataSource, entitie);
    },
  })

  viewer.dataSources.add(dataSource)
  return { dataSource, entitie }
}
// 删除点
export function removeDntitie(obj) {
  viewer.dataSources.remove(obj.dataSource, obj.entitie)
}
// 飞行目标点
export function flyToPoint(obj) {
  // if (viewer.camera.positionCartographic.height > 500) {
  viewer.flyTo(obj.entitie, {
    offset: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-90),
      range: 500,
    },
  })
  // }
}
export function flyToText(data) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(data.X, data.Y, 200),
    easingFunction: Cesium.EasingFunction.LINEAR_NONE,
  })
}
// 点击地图
export function left_click(callback) {
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction(function (event) {
    var earthPosition = viewer.camera.pickEllipsoid(
      event.position,
      viewer.scene.globe.ellipsoid
    )
    var cartographic = Cesium.Cartographic.fromCartesian(
      earthPosition,
      viewer.scene.globe.ellipsoid,
      new Cesium.Cartographic()
    )
    var lat = Cesium.Math.toDegrees(cartographic.latitude)
    var lng = Cesium.Math.toDegrees(cartographic.longitude)
    var height = cartographic.height
    // console.log('[Lng=>' + lng + ',Lat=>' + lat + ',H=>' + height + ']');
    callback({
      lat,
      lng,
      height,
    })
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
export function expImage(viewer, callback) {
  return viewer.mars.expImage({
    download: false,
    calback: function (base64, size) {
      //回调
      callback(base64)
    },
  })
}
window.pointsFromDegrees = null
// 画线初始化
export function glowingLine() {
  // http://3deditor.okaygis.com:10099/marsv/cesium-example/editor.html#29_draw
  window.drawControl = new okay3d.Draw(viewer, {
    // hasDel: function (e) {
    //     //当需要判断该entity是否可以删除时，在该回调方法中处理，return false不可删除
    //     var entity = e.target;
    //     return true;
    // }
  })
  //事件监听(可以自行加相关代码实现业务需求，此处主要做示例)
  drawControl.on(okay3d.draw.event.DrawStart, function (e) {
    console.log('开始绘制')
  })
  drawControl.on(okay3d.draw.event.DrawAddPoint, function (e) {
    console.log('绘制过程中增加了点', e)
  })
  drawControl.on(okay3d.draw.event.DrawRemovePoint, function (e) {
    console.log('绘制过程中删除了点')
  })

  drawControl.on(okay3d.draw.event.DrawCreated, function (e) {
    var entity = e.entity
    setPoints(entity)
    console.log('创建完成', pointsFromDegrees)
  })
  drawControl.on(okay3d.draw.event.EditStart, function (e) {
    var entity = e.entity
    // startEditing(entity)
    console.log('开始编辑')
  })
  drawControl.on(okay3d.draw.event.EditMovePoint, function (e) {
    var entity = e.entity
    setPoints(entity)
    console.log('编辑修改了点', pointsFromDegrees)
  })
  drawControl.on(okay3d.draw.event.EditRemovePoint, function (e) {
    var entity = e.entity
    // startEditing(entity)
    setPoints(entity)
    console.log('编辑删除了点')
  })
  drawControl.on(okay3d.draw.event.EditStop, function (e) {
    // stopEditing()
    console.log('停止编辑')
  })
  drawControl.on(okay3d.draw.event.Delete, function (e) {
    // stopEditing()
    console.log('删除了对象')
  })
}
// 画线
export function setDrawControl() {
  let arr = []
  // pointsFromDegrees.forEach((item) => {
  //   arr.push(item[0])
  //   arr.push(item[1])
  //   arr.push(item[2])
  // })
  // window.glowingLines = viewer.entities.add({
  //   polyline: {
  //     positions: Cesium.Cartesian3.fromDegreesArrayHeights(arr),
  //     width: 10,
  //     material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
  //   },
  // })
  let result = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          edittype: 'polyline',
          name: '线',
          config: {
            minPointNum: 3,
            height: true,
          },
          style: {
            color: '#0000FF',
            clampToGround: true,
          },
          // attr: {
          //   id: '20181221102330',
          // },
          type: 'polyline',
        },
        geometry: {
          type: 'LineString',
          coordinates: pointsFromDegrees,
        },
      },
    ],
  }
  console.log("setDrawControl", pointsFromDegrees)
  drawControl.loadJson(result, {
    clear: true,
    flyTo: true,
  })
}
// 画线点
function setPoints(entity) {
  var points = viewer.mars.draw.getPositions(entity)

  //拾取笛卡尔坐标
  var ellipsoid = viewer.scene.globe.ellipsoid //全局椭球体
  pointsFromDegrees = []
  points.forEach((item) => {
    var cartographic = ellipsoid.cartesianToCartographic(item)
    var lat = Cesium.Math.toDegrees(cartographic.latitude)
    var lng = Cesium.Math.toDegrees(cartographic.longitude)
    var alt = cartographic.height
    pointsFromDegrees.push([lng, lat, alt])
  })
  console.log('pointsFromDegrees', pointsFromDegrees)
}
// 点击画线
export function drawPolyline() {
  drawControl.startDraw({
    type: 'curve',
    style: {
      color: '#0000FF',
      width: '3',
      clampToGround: true,
    },
  })

}
let flyLine
let interval
//漫游业务相关
export function LineFly(option, calback) {
  stopFlyLine()
  if (!pointsFromDegrees) return
  console.log("pointsFromDegrees", pointsFromDegrees)
  let type = "gs"
  if (option.roamingType === "平视漫游") {
    type = "dy";
    pointsFromDegrees.forEach((item, index) => {
      pointsFromDegrees[index][2] = option.distance
    })
  }
  //该数据可以从 基础项目 飞行漫游功能界面操作后单个路线的 保存JSON
  var flydata = {
    name: '贴地漫游',
    interpolation: false, //是否setInterpolationOptions插值
    clockLoop: false,
    camera: {
      type: type, // gs
      heading: option.heading,
      distance: option.distance,
      "followedX": option.heading,
      "followedZ": 10
    },
    speed: option.speed,
    clampToGround: true,
    path: {
      show: false,
      color: '#ffff00',
      opacity: 0.5,
      width: 1,
      isAll: false,
    },
    points: pointsFromDegrees,
    "interpolation": true,//setInterpolationOptions插值
  }
  flyLine = new okay3d.FlyLine(viewer, flydata)
  // console.log('异步计算中', flyLine)
  if (calback) {
    calback('异步计算中')
  }
  if (option.roamingType === "平视漫游") {
    flyLine.start();
    calback('异步计算完成')
    setLineRom(option)
    //不贴地时，直接开始
    return
  }

  // startFly()

  //贴地时，异步计算完成后开始
  flyLine.clampToGround(
    function () {
      //异步计算完成贴地后再启动
      flyLine.start()
      // $.loading = false;
      // console.log('异步计算完成')
      if (calback) {
        calback('异步计算完成')
      }
      setLineRom(option)
      // startFly()
    },
    { has3dtiles: false }
  ) //区别在has3dtiles标识，true时贴模型表面
}
function setLineRom(option) {
  let lastPoint = pointsFromDegrees[pointsFromDegrees.length - 1]
  if (interval) {
    window.clearInterval(interval)
    interval = null
  }
  let errorValue = 3
  if (option.distance < 1000) {
    errorValue = 4
  }
  interval = setInterval(() => {
    // console.log("flyLine.timeinfo", flyLine.timeinfo)
    if (
      lastPoint[0].toFixed(errorValue) ==
      flyLine.timeinfo.x.toFixed(errorValue) &&
      lastPoint[1].toFixed(errorValue) ==
      flyLine.timeinfo.y.toFixed(errorValue)
    ) {
      stopFlyLine()

      console.log('漫游结束')
    }
    // viewer.trackedEntity =undefined;
  }, 100)
}
// 暂停漫游
export function stopFlyLine() {
  if (flyLine) {
    flyLine.stop()
  }

  if (interval) {
    window.clearInterval(interval)
  }
  viewer.trackedEntity = undefined
}
// 清除线条
export function deleteDrawAll() {
  drawControl.clearDraw()
  viewer.entities.removeAll()
}
export function getWindowObj() {
  return {
    // camera,
    scene,
    clock,
    viewer,
  }
}
