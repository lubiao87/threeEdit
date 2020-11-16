/* 2017-9-28 16:04:24 | 修改 木遥（QQ：346819890） */
//模块：
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
    },
    layerWork: null,
    //初始化[仅执行1次]
    create: function () {
        if (this.config.layerId)
            this.layerWork = this.viewer.mars.getLayer(this.config.layerId, 'id');
        else
            this.layerWork = this.viewer.mars.getLayer(this.config.name, 'name');
    },
    //打开激活
    activate: function () {
        if (this.layerWork == null) return;

        this.lastVisible = this.layerWork._visible;
        if (!this.lastVisible)
            this.layerWork.setVisible(true);
        this.layerWork.centerAt();
    },
    //关闭释放
    disable: function () {
        if (this.layerWork && !this.lastVisible)
            this.layerWork.setVisible(false);
    },





}));

