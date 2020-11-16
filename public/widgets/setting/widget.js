/* 2017-9-28 16:04:33 | 修改 木遥（QQ：346819890） */
//此方式：弹窗非iframe模式
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
        resources: [],
        //弹窗
        view: {
            type: "divwindow",
            url: "view.html",
            windowOptions: {
                width: 230,
                height: 120
            }
        },
    },
    //初始化[仅执行1次]
    create: function () {

    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        //此处可以绑定页面dom事件
        var viewer = this.viewer;

        //大气渲染
        $("#chk_skyAtmosphere").prop('checked', viewer.scene.skyAtmosphere.show);
        $("#chk_skyAtmosphere").change(function () {
            var visible = $(this).is(':checked');


            viewer.scene.skyAtmosphere.show = visible;
            viewer.scene.globe.showGroundAtmosphere = visible;
        });

        //光照渲染
        $("#chk_lightRender").prop('checked', viewer.scene.globe.enableLighting);
        $("#chk_lightRender").change(function () {
            var visible = $(this).is(':checked');

            viewer.scene.globe.enableLighting = visible;
            viewer.shadows = visible;
            viewer.terrainShadows = visible ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.RECEIVE_ONLY;
        });

        //深度监测
        $("#chk_testTerrain").prop('checked', viewer.scene.globe.depthTestAgainstTerrain);
        $("#chk_testTerrain").change(function () {
            var visible = $(this).is(':checked');

            viewer.scene.globe.depthTestAgainstTerrain = visible;
            if (visible) {
                toastr.info("深度监测打开后，您将无法看到地下或被地形遮挡的对象。");
            }
        });

        var  speedRatio = 10000; //步长比例，值越大步长约小。

        //键盘控制
        $("#chk_firstPerson").change(function () {
            var visible = $(this).is(':checked');
            viewer.mars.keyboard(visible,speedRatio);
            if (visible) {
                toastr.info("您可以键盘按A S D W Q E和上下左右键控制方向。<br/>并在漫游中滚轮滚动可以加速减速。");
            }
        });
    },
    //激活插件
    activate: function () {



    },
    //释放插件
    disable: function () {


    },




}));
