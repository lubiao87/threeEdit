/* 2017-11-30 15:04:37 | 修改 木遥（QQ：346819890） */
//模块：
var addmarkerWidget = okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    viewer: null, //框架会自动对map赋值
    options: {
        resources: ['map.css'],
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 300,
                height: 400
            }
        }
    },
    drawControl: null,
    //初始化[仅执行1次]
    create: function () {
        this.drawControl = new okay3d.Draw(this.viewer, {
            hasEdit: false,
        });

        //事件监听
        var that = this;
        this.drawControl.on(okay3d.draw.event.DrawCreated, function (e) {
            var entity = e.entity;
            that.bindMarkerEx(entity);
        });
        this.drawControl.on(okay3d.draw.event.EditMovePoint, function (e) {//编辑修改了点
            var entity = e.entity;

            that.saveEntity(entity);
        });

        //添加到图层控制
        if (window.bindToLayerControl) {
            this.layerWork = bindToLayerControl({
                pid: 0,
                name: '我的标记',
                visible: true,
                onAdd: function () {//显示回调
                    that.drawControl.setVisible(true);
                },
                onRemove: function () {//隐藏回调
                    that.drawControl.setVisible(false);
                },
                onCenterAt: function (duration) {//定位回调
                    var arr = that.drawControl.getEntitys();
                    that.viewer.flyTo(arr, { duration: duration });
                },
            });
        }

        this.getList();
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {
        this.hasEdit(true);
    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
        this.stopDraw();
        this.hasEdit(false);

        // //从图层控制中 移除
        // if(this.layerWork){
        //     unbindLayerControl(this.layerWork);
        // }
    },
    stopDraw: function () {
        this.drawControl.stopDraw();
    },
    drawPoint: function () {
        this.stopDraw();
        this.drawControl.startDraw({
            type: "billboard",
            style: {
                scale: 1,
                image: this.path + "img/marker.png"
            }
        });
    },
    editable: false,
    hasEdit: function (val) {
        this.editable = val;
        this.drawControl.hasEdit(val);
    },
    bindMarkerEx: function (entity) {
        if (entity == null || entity.position == null) return;
        entity.attribute.attr = entity.attribute.attr || {};
        entity.attribute.attr.id = "0";//(new Date()).format("yyyyMMddHHmmss");
        entity.attribute.attr.name = "我的标记";
        entity.label = this.getLabelStyle(entity.attribute.attr.name);
        entity.billboard.scaleByDistance = new Cesium.NearFarScalar(1.5e2, 1, 8.0e6, 0.2);
        var that = this;
        this.saveEntity(entity, function () {
            entity.popup = {
                html: function (entity) {
                    return that.getMarkerInhtml(entity.attribute.attr);
                },
                anchor: [0, -35]
            };
            that.viewer.mars.popup.show(entity, entity.position._value);
        });
    },
    //========================
    saveEditFeature: function (id) {
        var entity = this.drawControl.getEntityById(id);

        entity.attribute.attr = entity.attribute.attr || {};
        entity.attribute.attr.name = $.trim($("#addmarker_attr_name").val());
        entity.attribute.attr.remark = $.trim($("#addmarker_attr_remark").val());

        this.viewer.mars.popup.close();
        entity.label.text = entity.attribute.attr.name;

        this.saveEntity(entity);
    },
    deleteEditFeature: function (id) {
        var entity = this.drawControl.getEntityById(id);
        this.drawControl.deleteEntity(entity);

        this.viewer.mars.popup.close();
        this.viewWindow.refMarkerList();

        //服务端存储
        if (window.hasServer) {
            sendAjax({
                url: 'map/mark/' + id,
                type: "delete",
                success: function (data) {
                }
            });
        }
        else {//浏览器本地存储
            var storagedata = this.getJsonData();
            haoutil.storage.add(this.storageName, storagedata);
        }
    },
    getMarkerDataList: function () {
        var arr = [];
        var arrEntity = this.drawControl.getEntitys();
        for (var i = 0, len = arrEntity.length; i < len; i++) {
            if (!arrEntity[i].attribute.attr.name) arrEntity[i].attribute.attr.name = "我的标记";
            arr.push(arrEntity[i].attribute.attr);
        }
        return arr;
    },
    getMarkerInhtml: function (attr) {
        var inhtml;
        if (this.editable) {
            if (!attr.name || attr.name == "我的标记")
                attr.name = "";
            if (!attr.remark)
                attr.remark = "";
            if (!attr.id)
                attr.id = "0";
            inhtml = '<div class="addmarker-popup-titile">添加标记</div><div class="addmarker-popup-content" ><form >' +
                '<div class="form-group">  <label for="addmarker_attr_name">名称</label><input type="text" id="addmarker_attr_name" class="form-control" value="' + attr.name + '" placeholder="请输入标记名称"    /> </div>' +
                '<div class="form-group">  <label for="addmarker_attr_remark">备注</label><textarea id="addmarker_attr_remark" class="form-control" rows="3" style="resize: none;" placeholder="请输入备注（可选填）"   >' + attr.remark + '</textarea></div>' +
                '<div class="form-group" style="text-align: center;"><input type="button" class="btn btn-primary  btn-sm" value="保存" onclick="addmarkerWidget.saveEditFeature(' + attr.id + ')" />' +
                '&nbsp;&nbsp;<input type="button" class="btn btn-danger  btn-sm" value="删除" onclick="addmarkerWidget.deleteEditFeature(' + attr.id + ')" /></div>' +
                '</form></div>';
        } else {
            inhtml = '<div class="addmarker-popup-titile">我的标记</div><div class="addmarker-popup-content" ><form >' +
                '<div class="form-group"><label>名称</label>：' + attr.name + '</div>' +
                '<div class="form-group"><label>备注</label>：' + attr.remark + '</div>' +
                '</form></div>';
        }
        return inhtml;
    },
    centerAt: function (id) {
        var entity = this.drawControl.getEntityById(id);
        if (entity) {
            //参数解释：点数据：radius控制视距距离
            this.viewer.mars.flyTo(entity, { radius: 2500 });
        }
    },
    deleteAll: function () {
        this.drawControl.deleteAll();

        if (this.viewWindow)
            this.viewWindow.refMarkerList();

        //服务端存储
        if (window.hasServer && userId) {
            sendAjax({
                url: 'map/mark/del/' + userId,
                type: "delete",
                dataType: "json",
                success: function (data) {
                }
            });
        }
        else {//浏览器本地存储
            //本地存储
            haoutil.storage.del(this.storageName);
        }
    },
    label_font_style: "normal small-caps normal 19px 楷体",
    getLabelStyle: function (name) {
        return new Cesium.LabelGraphics({
            text: name == "" ? "我的标记" : name,
            font: this.label_font_style,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -50),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
        });
    },
    getJsonData: function () {
        var arr = [];
        var arrEntity = this.drawControl.getEntitys();
        for (var i = 0, len = arrEntity.length; i < len; i++) {
            var entity = arrEntity[i];
            var attr = entity.attribute.attr;
            var coord = okay3d.draw.attr.billboard.getCoordinates(entity);

            var item = {
                id: attr.id,
                name: attr.name,
                remark: attr.remark,
                x: coord[0][0],
                y: coord[0][1],
                z: coord[0][2]
            };
            arr.push(item);
        }
        return JSON.stringify(arr);
    },
    jsonToLayer: function (arr, isclear) {
        if (arr == null || arr.length == 0) return;
        if (isclear) {
            this.drawControl.deleteAll();
        }

        var that = this;
        var arrEntity = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (!item.x || !item.y) continue;

            var attribute = {
                type: "billboard",
                attr: {
                    id: item.id || "",
                    name: item.name || "",
                    remark: item.remark || ""
                },
                style: {
                    scale: 1,
                    image: this.path + "img/marker.png"
                }
            };

            if (!isclear) { //叠加时，清除已有同id数据
                var entity = this.drawControl.getEntityById(attribute.attr.id);
                this.drawControl.deleteEntity(entity);
            }

            var position = Cesium.Cartesian3.fromDegrees(item.x, item.y, item.z || 0.0);
            var entity = this.drawControl.attributeToEntity(attribute, position);
            entity.popup = {
                html: function (entity) {
                    return that.getMarkerInhtml(entity.attribute.attr);
                },
                anchor: [0, -35]
            };
            entity.billboard.scaleByDistance = new Cesium.NearFarScalar(1.5e2, 1, 8.0e6, 0.2);
            entity.label = this.getLabelStyle(attribute.attr.name);
            arrEntity.push(entity);
        }

        this.viewer.flyTo(arrEntity, { duration: 2.0 });

        if (this.viewWindow)
            this.viewWindow.refMarkerList();
    },
    storageName: "marsgis_addmarker",
    getList: function () {
        var that = this;

        //读取服务端存储
        if (window.hasServer) {
            var that = this;
            sendAjax({
                url: 'map/mark/list',
                type: 'get',
                success: function (arr) {
                    that.jsonToLayer(arr, true);
                }
            });
        }
        else {//读取本地存储
            var laststorage = haoutil.storage.get(this.storageName); //读取localStorage值
            if (laststorage != null && laststorage != 'null') {

                var arr = JSON.parse(laststorage);
                this.jsonToLayer(arr, true);
            }
        }
    },
    saveEntity: function (entity, endfun) {
        //服务端存储
        if (window.hasServer) {
            var attr = entity.attribute.attr;
            var coord = okay3d.draw.attr.billboard.getCoordinates(entity);
            var that = this;
            if (attr.id == "0") {//新增
                sendAjax({
                    url: 'map/mark/add',
                    data: JSON.stringify({
                        name: attr.name,
                        remark: attr.remark,
                        x: coord[0][0],
                        y: coord[0][1],
                        z: coord[0][2]
                    }),
                    type: 'post',
                    contentType: "application/json",
                    success: function (data) {
                        entity.attribute.attr.id = data.id;
                        if (endfun) endfun();
                        that.viewWindow.refMarkerList();
                    }
                });
            } else {//修改
                sendAjax({
                    url: 'map/mark/update',
                    data: JSON.stringify({
                        id: attr.id,
                        name: attr.name,
                        remark: attr.remark,
                        x: coord[0][0],
                        y: coord[0][1],
                        z: coord[0][2],
                    }),
                    type: 'post',
                    contentType: "application/json",
                    success: function (data) {
                        if (endfun) endfun();
                        that.viewWindow.refMarkerList();
                    }
                });
            }

        }
        else {//浏览器本地存储
            if (entity.attribute.attr.id == "0")
                entity.attribute.attr.id = (new Date()).format("yyyyMMddHHmmss");

            var storagedata = this.getJsonData();
            haoutil.storage.add(this.storageName, storagedata);

            if (endfun) endfun();
            this.viewWindow.refMarkerList();
        }

    },


}));