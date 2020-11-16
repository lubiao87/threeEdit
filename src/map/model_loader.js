// import * as Cesium from 'cesium/Cesium'
// import * as okay3d from '@/map/okay3d/okay3d' // 3-22版mar3d
import { Message } from 'element-ui';

var rotateRadio = 15 * 0.017453293
var origin_height
var zoomRadio
var error_num = 0
var change_num = 0
var planeEntities = []
var oriention = []
var is_cut = false
var has_clipping = false
var has_oriention = false
var target_radius = 10
var plane_0_x = 1
var plane_0_y = 0
var plane_0_distanc = 10
var plane_1_x = -1
var plane_1_y = 0
var plane_1_distanc = 10
var plane_2_x = 0
var plane_2_y = 1
var plane_2_distanc = 10
var plane_3_x = 0
var plane_3_y = -1
var plane_3_distanc = 10
var tilesetClip
var tilesetDX

export function createClippingPlanes() {
  // 创建裁剪平面
  let clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes: [
      new Cesium.ClippingPlane(
        new Cesium.Cartesian3(plane_0_x, plane_0_y, 0),
        plane_0_distanc
      ),
      new Cesium.ClippingPlane(
        new Cesium.Cartesian3(plane_1_x, plane_1_y, 0),
        plane_1_distanc
      ),
      new Cesium.ClippingPlane(
        new Cesium.Cartesian3(plane_2_x, plane_2_y, 0),
        plane_2_distanc
      ),
      new Cesium.ClippingPlane(
        new Cesium.Cartesian3(plane_3_x, plane_3_y, 0),
        plane_3_distanc
      ),
    ],
    edgeColor: Cesium.Color.GREY,
    edgeWidth: 1,
    // modelMatrix: m,
    unionClippingRegions: true,
  })

  tileset.clippingPlanes = clippingPlanes

  // 添加裁剪面
  if (is_cut) {
    for (var i = 0; i < 4; ++i) {
      var plane = clippingPlanes.get(i)
      var planeEntity = viewer.entities.add({
        position: tileset.boundingSphere.center,
        plane: {
          dimensions: new Cesium.Cartesian2(
            target_radius * 2,
            target_radius * 2
          ),
          material: Cesium.Color.WHITE.withAlpha(0.1),
          plane: new Cesium.CallbackProperty(
            createPlaneUpdateFunction(plane),
            false
          ),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
        },
      })

      planeEntities.push(planeEntity)
    }
  }
}

export function set_camera_oriention() {
  viewer.camera.setView({
    destination: new Cesium.Cartesian3(
      oriention[0],
      oriention[1],
      oriention[2]
    ),
    orientation: {
      heading: oriention[3],
      pitch: oriention[4],
      roll: oriention[5],
    },
  })
}
export function load_3dtile_layer(url) {}
export function load_model(url) {
  if (tileset != null) {
    viewer.scene.primitives.remove(tileset)
  }
  var _url = url
  haoutil.storage.add('32_onlymodel', _url)
  tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: _url,
      maximumScreenSpaceError: 1,
    })
  )
  tileset.readyPromise
    .then(function(tileset) {
      boundingSphere = tileset.boundingSphere
      viewer.camera.flyToBoundingSphere(
        boundingSphere,
        new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius * 2)
      )

      //限定缩放级别
      viewer.scene.screenSpaceCameraController.maximumZoomDistance =
        boundingSphere.radius * 5

      //记录模型原始的中心点
      var originalCenter = okay3d.tileset.getCenter(tileset)

      originalCenter.z = -originalCenter.z + 10
      okay3d.tileset.updateMatrix(tileset, originalCenter)
      clipTileset = new okay3d.tiles.TilesClipPlan(tileset)
      if (clipping.length != 0) {
        if (clipping[0] instanceof Array) {
          //以前版本的数据不加载
          return
        }

        clipByPoints(clipping)
      }
    })
    .otherwise(function(error) {
      haoutil.alert(error, '加载数据出错')
    })
  var mouse_middle_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  mouse_middle_handler.setInputAction(function(movement) {
    let temp_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    temp_handler.setInputAction(function(movement) {
      let startMousePosition = movement.startPosition
      let endMousePosition = movement.endPosition
      let y = endMousePosition.y - startMousePosition.y
      if (y > 0) {
        viewer.scene.screenSpaceCameraController.enableTilt = true
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN)

  let pincth_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  pincth_handler.setInputAction(function(start_position) {
    pincth_handler.setInputAction(function(movement) {
      if (
        movement.angleAndHeight.endPosition.y -
          movement.angleAndHeight.startPosition.y >
        0
      ) {
        viewer.scene.screenSpaceCameraController.enableTilt = true
      }
      if (
        movement.distance.endPosition.y - movement.distance.startPosition.y <
        0
      ) {
        viewer.scene.screenSpaceCameraController.enableZoom = true
      }
    }, Cesium.ScreenSpaceEventType.PINCH_MOVE)
  }, Cesium.ScreenSpaceEventType.PINCH_START)

  // 限制相机高度不低于模型中心
  let wheel_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  wheel_handler.setInputAction(function(movement) {
    if (movement < 0) {
      viewer.scene.screenSpaceCameraController.enableZoom = true
      simple_downsize(viewer)
    } else {
      simple_enlarge(viewer)
    }
  }, Cesium.ScreenSpaceEventType.WHEEL)

  mouse_middle_handler.setInputAction(function(movement) {
    simple_enlarge(viewer)
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}
export function load_model_layer(url, callback) {
  //加模型
  if($.tileset_new) {
    $.tileset_new.destroy();
    $.tileset_new = null;
  }
  okay3d.layer.createLayer(
    {
      type: '3dtiles',
      url: url,
      maximumScreenSpaceError: 20,
      visible: true,
      calback: function(tileset_new) {
        window.clipTileset = new okay3d.tiles.TilesClipPlan(tileset_new)
        $.tileset_new = tileset_new;
        window.boundingSphere = tileset_new.boundingSphere
        // boundingSphere.center.z -= 900;
        console.log("boundingSphere",boundingSphere)

         //限定缩放级别
        //  viewer.scene.screenSpaceCameraController.maximumZoomDistance = boundingSphere.radius * 5;

         //记录模型原始的中心点
         var originalCenter = okay3d.tileset.getCenter(tileset_new);

         originalCenter.z = -originalCenter.z + 5;
         okay3d.tileset.updateMatrix(tileset_new, originalCenter);
        // let position = boundingSphere;
        // position.center.z -= 900;
        setTimeout(() => {
          viewer.camera.flyToBoundingSphere(
            boundingSphere,
            new Cesium.HeadingPitchRange(0.0, 0, 0 )
          )
        }, 200);



        if(callback){callback()}
      },
    },
    viewer
  )
}
function reSet(boundingSphere) {
  viewer.camera.flyToBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius * 2));
}
var clip_points
export function draw_clip() {
  clipTileset.clear()

  viewer.mars.draw.startDraw({
    type: 'polygon',
    style: {
      color: '#007be6',
      opacity: 0.5,
      clampToGround: true,
    },
    success: function(entity) {
      //绘制成功后回调
      clip_points = viewer.mars.draw.getPositions(entity)
      viewer.mars.draw.deleteAll()
      clipByPoints(clip_points)
    },
  })
}
export function clipByPoints(ps) {
  clipTileset.clipByPoints(ps, {
    unionClippingRegions: true,
    edgeColor: Cesium.Color.GREY,
    edgeWidth: 1,
  })
}
export function clear_draw() {
  clipTileset.clear()
}
export function dot_product(a, b) {
  var dot_product = a.x * b.x + a.y * b.y + a.z * b.z
  var mo = Math.sqrt(Math.pow(b.x, 2) + Math.pow(b.y, 2) + Math.pow(b.z, 2))
  // console.log(dot_product / mo - mo);
  return dot_product / mo - mo < 5
}

export function get_pointFromScreenCenter() {
  var scene = viewer.scene
  var center_point = new Cesium.Cartesian2(
    viewer.canvas.clientWidth / 2,
    viewer.canvas.clientHeight / 2
  )
  var pickedObject = scene.pick(center_point)
  if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
    var position = viewer.scene.pickPosition(center_point)
    if (Cesium.defined(position)) {
      return position //模型
    } else {
      return viewer.camera.positionWC
    }
  } else {
    return viewer.camera.positionWC
  }
}

export function get_camera_position() {
  var camera = viewer.camera
  var p = camera.positionWC
  // console.log("Camera WC position:", p);
  return p //相机
}
//放大

export function simple_enlarge() {
  var cam_position = viewer.camera.positionWC;
  // var tileset_center = get_pointFromScreenCenter();
  //
  // if (!dot_product(cam_position, tileset_center)) {
  //     viewer.camera.zoomIn(zoomRadio);
  // }
  // zoomIn.activate()
  // viewer.camera.zoomIn(100)

  //拾取笛卡尔坐标
  var ellipsoid = viewer.scene.globe.ellipsoid; //全局椭球体
  //中心点位置
  var cartographic = ellipsoid.cartesianToCartographic(cam_position);
  var height = cartographic.height;
  if(height > 100) {
    viewer.camera.zoomIn(100)
  } else {
    Message({
      showClose: true,
      message: "以达到最小高度",
      type: "warning",
      duration: 1000
    });
  }
}
export function simple_downsize() {
  // viewer.camera.zoomOut(zoomRadio);
  // zoomOut.activate()
  var cam_position = viewer.camera.positionWC;
  //拾取笛卡尔坐标
  var ellipsoid = viewer.scene.globe.ellipsoid; //全局椭球体
  //中心点位置
  var cartographic = ellipsoid.cartesianToCartographic(cam_position);
  var height = cartographic.height;
  if(height < 1000) {
    viewer.camera.zoomOut(100)
  } else {
    Message({
      showClose: true,
      message: "以达到最大高度",
      type: "warning",
      duration: 1000
    });
  }
}

export function simple_rotate_to_left() {
  var m = get_pointFromScreenCenter()
  var c = get_camera_position()
  viewer.camera.rotate(m, rotateRadio)
}

export function simple_rotate_to_right() {
  var m = get_pointFromScreenCenter()
  var c = get_camera_position()
  viewer.camera.rotate(m, -rotateRadio)
}

export function pitch_look(center) {
  var cam = viewer.camera
  // var pitch = Cesium.Math.toDegrees(cam.pitch)
  // // if (pitch - 10 > -10 || pitch - 10 < -90) {
  // //   pitch = -10
  // // }
  // var m = get_pointFromScreenCenter()
  var heading = cam.heading
  var pitch = Cesium.Math.toRadians(pitch - 10)
  var range = tileset.boundingSphere.radius * 1.0
  // viewer.camera.lookAt(m, new Cesium.HeadingPitchRange(heading, pitch, range))
  // console.log(boundingSphere)
      //拾取笛卡尔坐标
      var ellipsoid = viewer.scene.globe.ellipsoid; //全局椭球体
      //中心点位置
      var cartographic = ellipsoid.cartesianToCartographic(boundingSphere.center);
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      var alt = cartographic.height;
      console.log(lng, lat, alt)
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      lng,
      lat - 0.001,
      alt + 50
    ),
    orientation : {
      // heading : Cesium.Math.toRadians(20.0),
      pitch : Cesium.Math.toRadians(-35.0),
      roll : 0.0
    },
    duration: 1,
  });

}

export function dsviewer() {
  viewer.zoomTo(
    tileset,
    new Cesium.HeadingPitchRange(
      0.0,
      Cesium.Math.toRadians(-90.0),
      tileset.boundingSphere.radius * 1.0
    )
  )
}

export function reset(callback) {
  if (has_oriention) {
    set_camera_oriention()
  } else {
    let option = new Cesium.HeadingPitchRange(
      0.0,
      -0.5,
      tileset.boundingSphere.radius * 1
    )
    option.duration = 1
    option.complete = function() {
      if (callback) {
        callback()
      }
    }
    viewer.camera.flyToBoundingSphere(tileset.boundingSphere, option)
  }
  // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, Cesium.Math.toRadians(-45.0), tileset.boundingSphere.radius * 1.0));
  viewer.scene.screenSpaceCameraController.enableTilt = true
  viewer.scene.screenSpaceCameraController.enableZoom = true
}

export function dynamic_radio() {
  tileset.readyPromise.then(function() {
    // console.log(viewer.camera.positionCartographic.height);
    viewer.scene.screenSpaceCameraController.maximumMovementRatio =
      (0.005 *
        (viewer.camera.positionCartographic.height -
          Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center)
            .height)) /
      tileset.boundingSphere.radius
    // console.log(viewer.scene.screenSpaceCameraController.maximumMovementRatio)
  })
}

export function screenshot(id) {
  var canvas = viewer.scene.canvas
  var genimg = Canvas2Image.convertToImage(
    canvas,
    canvas.width,
    canvas.height,
    'jpeg'
  )
  return genimg
}

export function screencanvas() {
  return viewer.scene.canvas
}

export function createPlaneUpdateFunction(plane) {
  // console.log(change_num);
  if (change_num == 0) {
    change_num += 1
    return function() {
      plane.distance = plane_0_distanc
      plane.normal.x = plane_0_x
      plane.normal.y = plane_0_y
      return plane
    }
  } else if (change_num == 1) {
    change_num += 1
    return function() {
      plane.distance = plane_1_distanc
      plane.normal.x = plane_1_x
      plane.normal.y = plane_1_y
      return plane
    }
  } else if (change_num == 2) {
    change_num += 1
    return function() {
      plane.distance = plane_2_distanc
      plane.normal.x = plane_2_x
      plane.normal.y = plane_2_y
      return plane
    }
  } else if (change_num == 3) {
    change_num += 1
    return function() {
      plane.distance = plane_3_distanc
      plane.normal.x = plane_3_x
      plane.normal.y = plane_3_y
      return plane
    }
  }
}

export function change_position(direction, r, d) {
  if (direction == 'east') {
    plane_1_distanc = d
    plane_1_y = -1 * Math.tan((-r * Math.PI) / 180)
    plane_1_y = plane_1_y.toPrecision(2)
  } else if (direction == 'south') {
    plane_2_distanc = d
    plane_2_x = -1 * Math.tan((-r * Math.PI) / 180)
    plane_2_x = plane_2_x.toPrecision(2)
  } else if (direction == 'west') {
    plane_0_distanc = d
    plane_0_y = Math.tan((-r * Math.PI) / 180)
    plane_0_y = plane_0_y.toPrecision(2)
  } else if (direction == 'north') {
    plane_3_distanc = d
    plane_3_x = Math.tan((-r * Math.PI) / 180)
    plane_3_x = plane_3_x.toPrecision(2)
  }
}

export function use_clipping() {
  is_cut = true
}

export function appling_clipping_planes(position) {
  // if (position.length != 0) {
  //     has_clipping = true;
  //     plane_0_x = position[2][0];
  //     plane_0_y = position[2][1];
  //     plane_0_distanc = position[2][3];
  //     plane_1_x = position[0][0];
  //     plane_1_y = position[0][1];
  //     plane_1_distanc = position[0][3];
  //     plane_2_x = position[1][0];
  //     plane_2_y = position[1][1];
  //     plane_2_distanc = position[1][3];
  //     plane_3_x = position[3][0];
  //     plane_3_y = position[3][1];
  //     plane_3_distanc = position[3][3];
  // }
}

export function get_clipping_planes() {
  // let eswn_arrays = [
  //     [plane_1_x, plane_1_y, 0, plane_1_distanc],
  //     [plane_2_x, plane_2_y, 0, plane_2_distanc],
  //     [plane_0_x, plane_0_y, 0, plane_0_distanc],
  //     [plane_3_x, plane_3_y, 0, plane_3_distanc],
  // ];
  // return eswn_arrays;
  return clip_points
}

export function get_camera_info() {
  let position = viewer.camera.positionWC
  let heading = viewer.camera.heading
  let pitch = viewer.camera.pitch
  let roll = viewer.camera.roll
  return [position.x, position.y, position.z, heading, pitch, roll].join('*')
}

export function appling_camera_oriention(data) {
  let string_arrays = data.split('*')
  if (string_arrays.length == 6) {
    has_oriention = true
    string_arrays.forEach(function(value, i) {
      oriention.push(parseFloat(value))
    })
  }
}
