/* 2017-9-28 16:04:33 | 修改 木遥（QQ：346819890） */
//此方式：弹窗非iframe模式
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
        resources: ['view.css', 'app.js'],
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
      // this.viewer.camera.flyTo({
      //   destination : Cesium.Cartesian3.fromDegrees(119.482189, 28.440942, 191.32),
      //   easingFunction : Cesium.EasingFunction.LINEAR_NONE,
      //   success: function (_viewer) {
      //     initWorkVideo();
      //   }
      // });

    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
      initWorkVideo();
    },
    //激活插件
    activate: function () {

    },
    //释放插件
    disable: function () {


    },




}));
