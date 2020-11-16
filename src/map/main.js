// import * as Cesium from 'cesium/Cesium'
// import * as okay3d from '@/map/okay3d/okay3d'  // 3-22版mar3d

//地图创建
export function createMap(id, config, calback) {
  var viewer = okay3d.createMap({
    id: id,
    data: config.map3d,
    serverURL: config.serverURL,
    center: config.map3d.center
  })
  if(calback)calback(viewer)
  return viewer
}

//初始化外部静态widget功能（兼容使用传统模式开发的一些widget）
export function initStaticWidget(viewer, widget) {
  okay3d.widget.init(viewer, widget)

  //绑定图层管理
  window.bindToLayerControl = function(options) {
    var layer = viewer.mars.addOperationalLayer(options)

    var manageLayersWidget = okay3d.widget.getClass(
      'widgets/manageLayers/widget.js'
    )
    if (manageLayersWidget) {
      manageLayersWidget.addOverlay(options)
    }
    return layer
  }
  //取消绑定图层管理 ， 参数为bindToLayerControl返回的图层
  window.unbindLayerControl = function(layer) {
    viewer.mars.removeOperationalLayer(layer.config.id)

    var manageLayersWidget = okay3d.widget.getClass(
      'widgets/manageLayers/widget.js'
    )
    if (manageLayersWidget) {
      manageLayersWidget.removeLayer(layer.config.name)
    }
  }
}
//当前页面业务相关
export function createLayer(url, callback) {
  //三维模型
  var _url = url
  // haoutil.storage.add("32_onlymodel", _url);
  var tilesets = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: _url,
      maximumScreenSpaceError: 1,
    })
  )
  // console.log(url)
  tilesets.readyPromise.then(function(tileset) {
    window.boundingSphere = tileset.boundingSphere
    // viewer.camera.flyToBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius * 2));

    // console.log(boundingSphere)


    //记录模型原始的中心点
    var originalCenter = okay3d.tileset.getCenter(tileset)

    originalCenter.z = -originalCenter.z + 10
    okay3d.tileset.updateMatrix(tileset, originalCenter)
    window.tileset = tileset
    window.clipTileset = new okay3d.tiles.TilesClipPlan(tileset)
    //限定缩放级别
  viewer.scene.screenSpaceCameraController.maximumZoomDistance =
  boundingSphere.radius * 10
  // viewer.scene.screenSpaceCameraController.enableRotate = false
    if (callback) {
      callback()
    }
  })

  // viewer.scene.screenSpaceCameraController.enableTilt = false;

  var mouse_middle_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    mouse_middle_handler.setInputAction(function (movement) {
        let temp_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        temp_handler.setInputAction(function (movement) {
            let startMousePosition = movement.startPosition;
            let endMousePosition = movement.endPosition;
            let y = endMousePosition.y - startMousePosition.y;
            if (y > 0) {
                viewer.scene.screenSpaceCameraController.enableTilt = true;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

    let pincth_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    pincth_handler.setInputAction(function (start_position) {
        pincth_handler.setInputAction(function (movement) {
            if (movement.angleAndHeight.endPosition.y - movement.angleAndHeight.startPosition.y > 0) {
                viewer.scene.screenSpaceCameraController.enableTilt = true;
            }
            if (movement.distance.endPosition.y - movement.distance.startPosition.y < 0) {
                viewer.scene.screenSpaceCameraController.enableZoom = true;
            }
        }, Cesium.ScreenSpaceEventType.PINCH_MOVE);
    }, Cesium.ScreenSpaceEventType.PINCH_START);

    // 限制相机高度不低于模型中心
    let wheel_handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    wheel_handler.setInputAction(function (movement) {
        if (movement < 0) {
            viewer.scene.screenSpaceCameraController.enableZoom = true;
            simple_downsize(viewer)
        } else {
            simple_enlarge(viewer)
        }
    }, Cesium.ScreenSpaceEventType.WHEEL);

    mouse_middle_handler.setInputAction(function (movement) {
        simple_enlarge(viewer);
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}
export function simple_downsize() {
  // viewer.camera.zoomOut(zoomRadio);
  zoomOut.activate();
}
export function simple_enlarge() {
  // var cam_position = viewer.camera.positionWC;
  // var tileset_center = get_pointFromScreenCenter();
  //
  // if (!dot_product(cam_position, tileset_center)) {
  //     viewer.camera.zoomIn(zoomRadio);
  // }
  zoomIn.activate();
}

// 点击地图
export function left_click(fn) {
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction(function(event) {
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
    fn({
      lat,
      lng,
      height,
    })
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
export function expImage(viewer, fn) {
  return viewer.mars.expImage({
    download: false,
    calback: function(base64, size) {
      //回调
      fn(base64)
    },
  })
}
// let clip_points = null;
export function draw_clip(callback) {
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
      window.clip_points = viewer.mars.draw.getPositions(entity)
      viewer.mars.draw.deleteAll()
      clipByPoints(clip_points)
      if (callback) {
        callback()
      }
    },
  })
}
export function clear_draw() {
  clipTileset.clear()
  clip_points = []
}
export function clipByPoints(ps) {
  if (ps.length) {
    clipTileset.clipByPoints(ps, {
      unionClippingRegions: true,
      edgeColor: Cesium.Color.GREY,
      edgeWidth: 1,
    })
  }
}

//相机移动后
export function setMoveEnd(fn) {
  viewer.scene.camera.moveEnd.addEventListener(fn)
}
