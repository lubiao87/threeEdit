var drawControl;
 //当前页面业务相关
 function initWorkBuffer() {

  drawControl = new okay3d.Draw(viewer, { hasEdit: true });

  drawControl.on(okay3d.draw.event.DrawCreated, function (e) {
      updateBuffer(e.entity);
  });
  drawControl.on(okay3d.draw.event.EditMovePoint, function (e) {
      updateBuffer(e.entity);
  });


  $("#txtRadius").change(function (e) {
      if (lastgeojson)
          updateBuffer();
  });
}


function drawPoint() {
  deleteAll();

  drawControl.startDraw({
      type: "point",
      style: {
          pixelSize: 12,
          color: '#ffff00'
      }
  });
}

function drawPolyline() {
  deleteAll();

  drawControl.startDraw({
      type: "polyline",
      style: {
          color: "#ffff00",
          width: 3,
          clampToGround: true,
      }
  });
}

function drawPolygon() {
  deleteAll();

  drawControl.startDraw({
      type: "polygon",
      style: {
          color: "#ffff00",
          outline: true,
          outlineColor: "#f0ce22",
          outlineWidth: 4,
          opacity: 0.5,
          clampToGround: true
      }
  });
}

function deleteAll() {
  drawControl.deleteAll();

  if (lastdataSource) {
      viewer.dataSources.remove(lastdataSource);
      lastdataSource = null;
  }
  lastgeojson = null;
}


var lastdataSource;
var lastgeojson;

function updateBuffer(entity) {
  if (lastdataSource) {
      viewer.dataSources.remove(lastdataSource);
      lastdataSource = null;
  }

  var width = Number($("#txtRadius").val()); //km

  var buffere
  try {
      var geojson = entity ? drawControl.toGeoJSON(entity) : lastgeojson;
      geojson.properties = {};

      buffere = turf.buffer(geojson, width, { units: 'kilometers' });

      lastgeojson = geojson;

  } catch (e) {
      console.log(e);
  }
  if (!buffere) return;


  Cesium.GeoJsonDataSource.load(buffere, {
      stroke: new Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.7),
      strokeWidth: 2,
      fill: new Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.4),
      clampToGround: true
  }).then(function (dataSource) {
      lastdataSource = dataSource;
      viewer.dataSources.add(dataSource);

  }).otherwise(function (error) {
          haoutil.alert(error, "加载数据出错");
  });


}