/* 2017-11-23 09:27:14 | 修改 木遥（QQ：346819890） */
//此方式：弹窗非iframe模式
var toolPrint = okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
        resources: [
            'view.css',
        ],
        view: [
            { type: "append", url: "view.html" }
        ],
    },
    //初始化[仅执行1次]
    create: function () {

    },
    winCreateOK: function (opt, result) {
        var that = this;
        $("#btn_print_expimg").click(function () {
            that.expImg();
        });
        $("#btn_print_start").click(function () {
            that.printview();
        });
        $("#btn_print_close").click(function () {
            that.disableBase();
        });
    },
    //激活插件
    activate: function () {
        //隐藏div
        $(".no-print-view").hide();

        $(".cesium-viewer-toolbar").hide();
        $(".cesium-viewer-fullscreenContainer").hide();

    },
    //释放插件
    disable: function () {
        //还原显示div
        $(".no-print-view").show();

        $(".cesium-viewer-toolbar").show();
        $(".cesium-viewer-fullscreenContainer").show();
    },
    printview: function () {
        window.print();
    },
    expImg: function () {
        haoutil.loading.show();

        viewer.mars.expImage();

        haoutil.loading.hide();
    }




}));
