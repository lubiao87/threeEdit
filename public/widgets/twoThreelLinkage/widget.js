/* 2017-9-28 16:04:33 | 修改 木遥（QQ：346819890） */
//此方式：弹窗非iframe模式
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
        resources: ['view.css','map2D3D.js'],
        //弹窗
        view: {
            type: "append",
            url: "view.html",
            parent: 'body'
            // windowOptions: {
            //     width: 230,
            //     height: 120
            // }
        },
    },
    //初始化[仅执行1次]
    create: function () {
      document.getElementById("centerDiv").style.width = "100%";
      let dem2d = $("#centerDivEx2");
      console.log("释放插件")
      if(dem2d){$("#centerDivEx2").hide()}
      // console.log("baseUrl", baseUrl)

    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
      map2D3D.viewTo23D(); //默认分屏
      $.getJSON(this.path + "map2D3D.json", function (config) {
        map2D3D.createMap2D('cesiumContainerEx2', config.map);
          // map2D3D.createMap2D('map', data.map);
      });
      // $.ajax({
      //     type: "get",
      //     // contentType: "application/json; charset=utf-8",
      //     dataType: "json",
      //     url: "http://3deditor.okaygis.com:10099/marsv/cesium-example/js/map2d3d.json",
      //     success: function (config) {
      //       console.log("config", config)
      //         map2D3D.createMap2D('map', config.map);
      //         map2D3D.createMap3D('cesiumContainer', config.map3d);
      //     },
      //     error: function (XMLHttpRequest, textStatus, errorThrown) {
      //         haoutil.loading.hide();
      //         haoutil.alert("Json文件" + opt.url + "加载失败！");
      //     }
      // });
    },
    //激活插件
    activate: function () {
      // $("#cesiumContainer").css({ width: "50%" });
      // window.overMap.show()
      console.log("激活插件")
    },
    //释放插件
    disable: function () {
      // $("#cesiumContainer").css({ width: "100%" });
      // window.overMap.hide();

      console.log("释放插件")
      document.getElementById("centerDiv").style.width = "100%";
      // show3DMap()

    },
    invalidateSize: function () {
      console.log("invalidateSize")
    },



}));
