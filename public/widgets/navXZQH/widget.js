/* 2017-12-5 17:38:24 | 修改 木遥（QQ：346819890） */
//模块：
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 220,
                height: 440,
            }
        }
    },
    //初始化[仅执行1次]
    create: function () {

    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //打开激活
    activate: function () {

    },
    //关闭释放
    disable: function () {
        this.viewWindow = null;
        this.clearLastRegion();

    },

    //显示行政区划边界
    last_region: null,
    clearLastRegion: function () {
        if (this.last_region != null) {
            this.viewer.dataSources.remove(this.last_region);
            this.last_region = null;
        }
        if (this.last_timetemp != -1) {
            clearTimeout(this.last_timetemp);
            this.last_timetemp = -1;
        }
    },
    last_timetemp: -1,
    showRegionExtent: function (geojson) {
        this.clearLastRegion();

        var that = this;
        var dataSource = Cesium.GeoJsonDataSource.load(geojson, {
            clampToGround: true,
            stroke: new Cesium.Color.fromCssColorString("#ffffff"),
            strokeWidth: 2,
            fill: new Cesium.Color.fromCssColorString("#ffff00").withAlpha(0.5)
        });
        dataSource.then(function (dataSource) {
            that.viewer.dataSources.add(dataSource);
            that.last_region = dataSource;

            that.viewer.flyTo(dataSource.entities.values, { duration: 2 });
        }).otherwise(function (error) {
            toastr.error(error);
        });


        //定时清除
        // var that = this;
        // this.last_timetemp = setTimeout(function () {
        //     that.clearLastRegion();
        // }, 5000);
    },
    goHome: function () {
        this.clearLastRegion();

        this.viewer.mars.centerAt();
    }



}));