//当前页面业务相关
var videoElement;
function initWorkVideo() {
  //加个模型，效果更NB
  // okay3d.layer.createLayer({
  //   "type": "3dtiles",
  //   "name": "县城社区",
  //   "url": "http://data.marsgis.cn/3dtiles/qx-shequ/tileset.json",
  //   "offset": { "z": 3 },
  //   "visible": true
  // }, viewer);
  $("#video-play").attr("disabled", true);
  videoElement = document.getElementById('trailer');
  $("#video-play").click(function () {
    if (videoElement.paused) {
      videoElement.play();
      $(this).html('<span class="fa fa-pause" aria-hidden="true"></span> 暂停');
    } else {
      videoElement.pause();
      $(this).html('<span class="fa fa-play" aria-hidden="true"></span> 播放');
    }
  });
  $("#txtAngle").range({
    onChange: function (value, bfb) {
      rotation = Cesium.Math.toRadians(value)
    }
  });


  viewer.mars.draw.hasEdit(true);

  //竖立视频
  var sphere = viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights([
        119.481296, 28.439986, 122,
        119.481163, 28.440101, 122,
        119.481162, 28.440102, 131,
        119.481299, 28.439988, 131,
        119.481296, 28.439986, 122
      ])),
      material: videoElement,
      stRotation: Cesium.Math.toRadians(0),//视频旋转角度
      perPositionHeight: true,
      outline: false
    }
  });

  //地面视频
  var sphere2 = viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights([
        119.481749,
        28.440171,
        0,
        119.481385,
        28.440457,
        0,
        119.481911,
        28.44094,
        0,
        119.482254,
        28.440653,
        0,
        119.481749,
        28.440171,
        0
      ])),
      material: videoElement,
      stRotation: Cesium.Math.toRadians(130),//视频旋转角度
      perPositionHeight: false,
      outline: false
    }
  });
}
var rotation = 0;
function getRotationValue() {
  return rotation;
}

function drawRectangle() {
  viewer.mars.draw.startDraw({
    type: "rectangle",
    style: {
      color: "#ffff00",
      opacity: 0.2,
      clampToGround: true,
    },
    success: function (entity) {
      console.log("entity", entity)
      entity.rectangle.material = videoElement;
      $("#video-play").attr("disabled", false);
      entity.rectangle.rotation = new Cesium.CallbackProperty(getRotationValue, false)
      entity.rectangle.stRotation = new Cesium.CallbackProperty(getRotationValue, false)

    }
  });
}


//绘制这个polygon的时候，点的绘制顺序和面的角度不同，会使画面翻转
function drawPolygon(clampToGround) {
  viewer.mars.draw.startDraw({
    type: "polygon",
    style: {
      color: "#ffff00",
      opacity: 0.2,
      clampToGround: clampToGround,
    },
    success: function (entity) {
      $("#video-play").attr("disabled", false);
      entity.polygon.material = videoElement;
      entity.polygon.stRotation = new Cesium.CallbackProperty(getRotationValue, false);
    }
  });
}


function clearDraw() {
  $("#video-play").attr("disabled", true);
  viewer.mars.draw.clearDraw();
  viewer.entities.removeAll();
}