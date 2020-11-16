//二三维地图联动控制
var map2D3D = {
  map2d: null,    //leaflet map 对象
  viewer: viewer,    //cesium viewer对象
  createMap2D: function (id, jsondata) {
      var that = this;
      L.mars.createMap({
          id: id,
          data: jsondata,
          success: function (map, gisdata, jsondata) {
              that.map2d = map;
              that.bind2dEvent(map);
              that.bind3dEvent(viewer);
              that._map_extentChangeHandler();
          }
      });
  },
  createMap3D: function (id, jsondata) {
      var that = this;
      okay3d.createMap({
          id: id,
          data: jsondata,
          sceneModePicker: false,  //是否显示投影方式控件
          homeButton: true,        //回到默认视域按钮
          navigationHelpButton: true,    //是否显示帮助信息控件
          infoBox: false,             //是否显示点击要素之后显示的信息
          success: function (viewer, jsondata) {
              that.viewer = viewer;
              that.bind3dEvent(viewer);
              that._map_extentChangeHandler();
          }
      });
  },
  viewTo2d: function () {
      $("#centerDiv").hide();
      $("#centerDivEx2").css({ width: "100%" }).show();
      if (this.map2d)
          this.map2d.invalidateSize(false);
  },
  viewTo3d: function () {
      $("#centerDivEx2").hide();
      $("#centerDiv").css({ width: "100%" }).show();
  },
  viewTo23D: function () {
      $("#centerDivEx2").css({ width: "50%" }).show();
      $("#centerDiv").css({ width: "50%" }).show();
      if (this.map2d)
          this.map2d.invalidateSize(false);
  },
  //二维地图变化事件
  bind2dEvent: function () {
      this.map2d.on("drag", this._map_extentChangeHandler, this);
      this.map2d.on("zoomend", this._map_extentChangeHandler, this);
  },
  unbind2dEvent: function () {
      this.map2d.off("drag", this._map_extentChangeHandler, this);
      this.map2d.off("zoomend", this._map_extentChangeHandler, this);
  },
  _map_extentChangeHandler: function (e) {
      var bounds = this.map2d.getBounds();
      var extent = {
          xmin: bounds.getWest(),
          xmax: bounds.getEast(),
          ymin: bounds.getSouth(),
          ymax: bounds.getNorth(),
      }

      this.unbind3dEvent();
      this.viewer.camera.setView({
          destination: Cesium.Rectangle.fromDegrees(extent.xmin, extent.ymin, extent.xmax, extent.ymax),
      });
      this.bind3dEvent();
  },
  //三维地图相机移动结束事件
  bind3dEvent: function () {
      this.viewer.scene.camera.changed.addEventListener(this.camera_moveEndHandler, this);
  },
  unbind3dEvent: function () {
      this.viewer.scene.camera.changed.removeEventListener(this.camera_moveEndHandler, this);
  },
  camera_moveEndHandler: function (e) {
      // 范围对象
      var point = okay3d.point.getCenter(this.viewer);


      this.unbind2dEvent();

      var level = this.getLevel(this.viewer);
      this.map2d.setView([point.y, point.x], level, { animate: false });

      this.bind2dEvent();

  },
  getLevel: function (viewer) {
      var _layers = viewer.imageryLayers._layers;
      if (_layers.length == 0) return -1;

      var _imageryCache = _layers[0]._imageryCache;
      var maxLevel = 0;
      for (var i in _imageryCache) {
          var imagery = _imageryCache[i];
          if (imagery.level > maxLevel)
              maxLevel = imagery.level;
      }
      return maxLevel;
  }


};
