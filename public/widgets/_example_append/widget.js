/* 2017-9-28 16:04:33 | 修改 木遥（QQ：346819890） */
//此方式：弹窗非iframe模式
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
        resources: [
            'view.css'
        ],
        //弹窗
        view: {
            type: "append",
            url: "view.html"
        },
    },
    //初始化[仅执行1次]
    create: function () {

    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        //此处可以绑定页面dom事件

    },
    //激活插件
    activate: function () {


        toastr.info('激活插件_example_append');

    },
    //释放插件
    disable: function () {

        toastr.info('释放插件_example_append');

    },




}));
