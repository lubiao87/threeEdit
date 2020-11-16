//模块：
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
        resources: [
            //字体标号使用到的div转img库，无此标号时可以删除
            "./lib/dom2img/dom-to-image.js",
        ],
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 250,
                position: {
                    "top": 50,
                    "right": 5,
                    "bottom": 5
                }
            }
        },
    },
    drawControl: null,
    getServerURL: function () {
        return this.viewer.mars.config.serverURL;
    },
    //初始化[仅执行1次]
    create: function () {
        var that = this;

        this.drawControl = new okay3d.Draw(this.viewer, {
            hasEdit: false,
            nameTooltip: true,
        });

        //事件监听
        this.drawControl.on(okay3d.draw.event.DrawCreated, function (e) {
            var entity = e.entity;
            that.startEditing(entity);
        });
        this.drawControl.on(okay3d.draw.event.EditStart, function (e) {
            var entity = e.entity;
            that.startEditing(entity);
        });
        this.drawControl.on(okay3d.draw.event.EditMovePoint, function (e) {
            var entity = e.entity;
            that.startEditing(entity);
        });
        this.drawControl.on(okay3d.draw.event.EditRemovePoint, function (e) {
            var entity = e.entity;
            that.startEditing(entity);
        });
        this.drawControl.on(okay3d.draw.event.EditStop, function (e) {
            var entity = e.entity;
            that.stopEditing(entity);

            that.sendSaveEntity(entity); //保存数据
            that.showTable();
        });

        this.drawControl.on(okay3d.draw.event.Delete, function (e) {
            that.sendDeleteEntity(e.entity);//保存数据
            that.showTable();
        });


        ////编辑时拖拽点颜色（修改内部默认值）
        //okay3d.draw.dragger.PointColor.Control = new Cesium.Color.fromCssColorString("#1c197d");          //位置控制拖拽点
        //okay3d.draw.dragger.PointColor.MoveHeight = new Cesium.Color.fromCssColorString("#9500eb");       //上下移动高度的拖拽点
        //okay3d.draw.dragger.PointColor.EditAttr = new Cesium.Color.fromCssColorString("#f73163");         //辅助修改属性（如半径）的拖拽点
        //okay3d.draw.dragger.PointColor.AddMidPoint = new Cesium.Color.fromCssColorString("#04c2c9").withAlpha(0.3);     //增加新点，辅助拖拽点

        ////标绘时的tooltip（修改内部默认值）
        //okay3d.draw.tooltip.draw.point.start = '单击 完成绘制';
        //okay3d.draw.tooltip.draw.polyline.start = '单击 开始绘制';
        //okay3d.draw.tooltip.draw.polyline.cont = '单击增加点，右击删除点';
        //okay3d.draw.tooltip.draw.polyline.end = '单击增加点，右击删除点<br/>双击完成绘制';
        //okay3d.draw.tooltip.draw.polyline.end2 = '单击完成绘制';
        //okay3d.draw.tooltip.edit.start = '单击后 激活编辑';
        //okay3d.draw.tooltip.edit.end = '释放后 完成修改';
        //okay3d.draw.tooltip.dragger.def = '拖动 修改位置'; //默认拖拽时提示
        //okay3d.draw.tooltip.dragger.addMidPoint = '拖动 增加点';
        //okay3d.draw.tooltip.dragger.moveHeight = '拖动 修改高度';
        //okay3d.draw.tooltip.dragger.editRadius = '拖动 修改半径';
        //okay3d.draw.tooltip.del.def = '<br/>右击 删除该点';
        //okay3d.draw.tooltip.del.min = '无法删除，点数量不能少于';

        //添加到图层控制
        if (window.bindToLayerControl) {
            this.layerWork = bindToLayerControl({
                pid: 0,
                name: '标绘',
                visible: true,
                onAdd: function () { //显示回调
                    that.drawControl.setVisible(true);
                },
                onRemove: function () { //隐藏回调
                    that.drawControl.setVisible(false);
                },
                onCenterAt: function (duration) { //定位回调
                    var arr = that.drawControl.getEntitys();
                    that.viewer.flyTo(arr, {
                        duration: duration
                    });
                },
            });
        }

        this.sendGetList();
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {
        this.drawControl.hasEdit(true);
    },
    //释放插件
    disable: function () {
        this.stopEditing();

        this.viewWindow = null;
        this.drawControl.stopDraw();
        this.drawControl.hasEdit(false);
        //this.deleteAll();

        //从图层控制中 移除
        //  if(this.layerWork){
        //     unbindLayerControl(this.layerWork);
        // }
    },
    getDefStyle: function (type) {
        return okay3d.draw.util.getDefStyle(type)
    },
    //开始标记
    startDraw: function (defval) {
        if (defval && defval.type === "model") {
            haoutil.msg("模型根据其大小需要一点加载时间，请稍等片刻。");
        }

        // console.log(JSON.stringify(defval));
        this.drawControl.startDraw(defval);
    },
    //结束绘制、等同双击完成绘制，比如手机端无法双击结束
    endDraw: function () {
        this.drawControl.endDraw();
    },
    startEditingById: function (id) {
        var entity = this.drawControl.getEntityById(id);
        if (entity == null) return;
        this.viewer.mars.flyTo(entity);
        entity.startEditing();
    },
    startEditing: function (entity) {
        var that = this;
        if (this.viewWindow == null) return;
        var lonlats = this.drawControl.getCoordinates(entity);

        clearTimeout(this.timeTik);

        var plotAttr = okay3d.widget.getClass('widgets/plotAttr/widget.js');
        if (plotAttr && plotAttr.isActivate) {
            plotAttr.startEditing(entity, lonlats);
        }
        else {
            okay3d.widget.activate({
                uri: 'widgets/plotAttr/widget.js',
                entity: entity,
                lonlats: lonlats,
                deleteEntity: function (entity) {
                    that.deleteCurrentEntity(entity);
                },
                updateAttr: function (attr) {
                    that.updateAttr2map(attr);
                },
                updateGeo: function (positions) {
                    that.updateGeo2map(positions);
                },
                centerAt: function (entity) {
                    that.centerCurrentEntity(entity);
                },
            });
        }
    },
    stopEditing: function () {
        this.timeTik = setTimeout(function () {
            okay3d.widget.disable('widgets/plotAttr/widget.js');
        }, 200);
    },
    //更新图上的属性
    updateAttr2map: function (attr) {
        this.drawControl.updateAttribute(attr);
    },
    //更新图上的几何形状、坐标等
    updateGeo2map: function (positions) {
        this.drawControl.setPositions(positions); //更新当前编辑的entity

        if (positions.length <= 3) {
            var entity = this.drawControl.getCurrentEntity();
            this.centerCurrentEntity(entity);
        }

        return positions;
    },
    centerCurrentEntity: function (entity) {
        //参数解释：线面数据：scale控制边界的放大比例，点数据：radius控制视距距离
        this.viewer.mars.flyTo(entity, { scale: 0.5, radius: 1000 });
    },
    //文件处理
    getGeoJson: function () {
        return this.drawControl.toGeoJSON();
    },
    getCurrentEntityGeoJson: function () {
        var entity = this.drawControl.getCurrentEntity();
        if (entity == null) return;

        return this.drawControl.toGeoJSON(entity);
    },
    jsonToLayer: function (json, isClear, isFly) {
        if (json == null) return;

        this.showTable(json);

        return this.drawControl.loadJson(json, {
            clear: isClear,
            flyTo: isFly
        });
    },
    deleteAll: function () {
        this.drawControl.deleteAll();
        this.sendDeleteAll();

        this.showTable();
    },
    deleteEntity: function (id) {
        var entity = this.drawControl.getEntityById(id);
        if (entity == null) return;

        this.drawControl.deleteEntity(entity);
    },

    isOnDraw: false,
    deleteCurrentEntity: function (entity) {
        var entity = entity || this.drawControl.getCurrentEntity();
        if (entity == null) return;

        this.drawControl.deleteEntity(entity);
    },
    hasEdit: function (val) {
        this.drawControl.hasEdit(val);
    },
    //搜索
    query: function (text, maxcount) {
        var arrEntity = this.drawControl.getEntitys();

        var arr = [];
        var counts = 0;
        for (var i = 0; i < arrEntity.length; i++) {
            var entity = arrEntity[i];

            var name;
            if (entity.attribute.type === "label") {
                name = entity.attribute.style.text;
            } else if (entity.attribute.attr) {
                name = entity.attribute.attr.name;
            }

            if (name == null || name.indexOf(text) == -1) continue;

            arr.push({
                name: name,
                type: '标绘 - ' + entity.attribute.name,
                _datatype: 'plot',
                _entity: entity
            });

            if (maxcount) {
                counts++;
                if (counts > maxcount) break;
            }
        }
        return arr;
    },
    //弹窗属性编辑处理
    last_window_param: null,
    showEditAttrWindow: function (param) {
        this.last_window_param = param;

        //layer.open({
        //    type: 2,
        //    title: '选择数据',
        //    fix: true,
        //    shadeClose: false,
        //    maxmin: true,
        //    area: ["100%", "100%"],
        //    content: "test.html?name=" + param.attrName + "&value=" + param.attrVal,
        //    skin: "layer-mars-dialog animation-scale-up",
        //    success: function (layero) {

        //    }
        //});
    },
    saveWindowEdit: function (attrVal) {
        this.viewWindow.plotEdit.updateAttr(this.last_window_param.parname, this.last_window_param.attrName, attrVal);
        layer.close(layer.index);
    },

    showTable: function (json) {
        json = json || this.getGeoJson();

        var arr = [];
        if (json && json.features) {
            for (var i = 0, len = json.features.length; i < len; i++) {
                var feature = json.features[i];

                arr.push({
                    index: i,
                    name: feature.properties.attr.name || feature.properties.name,
                    type: feature.properties.type,
                });
            }
        }
        this.arrList = arr;

        if (this.viewWindow)
            this.viewWindow.tableWork.loadData(arr);
    },
    showTableItem: function (item) {
        var entity = this.drawControl.getEntitys()[item.index];
        this.viewer.mars.flyTo(entity);
    },
    delTableItem: function (item) {
        var entity = this.drawControl.getEntitys()[item.index];
        this.drawControl.deleteEntity(entity);
    },

    storageName: "marsgis_plot",
    sendGetList: function () {
        var that = this;
        if (window.hasServer) {
            //读取后台存储
            sendAjax({
                url: 'map/plot/list',
                type: 'get',
                success: function (arr) {
                    var arrjson = [];
                    for (var i = 0; i < arr.length; i++) {
                        var geojson = JSON.parse(arr[i].geojson);
                        geojson.properties.attr.id = arr[i].id;
                        arrjson.push(geojson);
                    }
                    var thisJson = {
                        type: "FeatureCollection",
                        features: arrjson
                    }
                    var entitys = that.drawControl.loadJson(thisJson, {
                        clear: true,
                        flyTo: false
                    });
                    that.showTable(thisJson);
                }
            });
        } else {
            //读取本地存储
            var laststorage = haoutil.storage.get(this.storageName); //读取localStorage值
            if (laststorage == null || laststorage == 'null') {
                //实际系统时可以注释下面代码，该代码是在线加载演示数据
                if (location.hostname != "127.0.0.1" && location.hostname != "localhost") {
                    $.getJSON("http://data.marsgis.cn/file/geojson/draw-demo.json", function (result) {
                        if (!that.isActivate) return;
                        that.jsonToLayer(result, true, true);
                    });
                }

            } else {
                var json = JSON.parse(laststorage);
                that.jsonToLayer(json, true, true);
            }
        }
    },
    sendSaveEntity: function (entity) {
        if (this.viewWindow == null) return;
        if (this.isOnDraw) {
            this.isOnDraw = false;
            return;
        }

        console.log("plot: 保存了数据")

        if (window.hasServer) {
            entity.attribute.attr = entity.attribute.attr || {};
            var entityId = entity.attribute.attr.id;

            //服务端存储
            var geojson = this.drawControl.toGeoJSON(entity);
            if (!entity.attribute.attr.name) {
                this.drawControl.deleteEntity(entity);
                haoutil.msg("名称不可为空！");
                return;
            }

            //新增
            if (!entityId) {
                sendAjax({
                    url: "map/plot/add",
                    type: "post",
                    data: JSON.stringify({
                        name: entity.attribute.attr.name || "", //名称
                        geojson: geojson || "", //geojson
                        type: entity.attribute.type, //类型
                        remark: entity.attribute.attr.remark || "", //备注
                    }),
                    contentType: "application/json",
                    success: function (data) {

                        entity.attribute.attr.id = data.id;
                    }
                });
            } else {
                //修改
                sendAjax({
                    url: "map/plot/update",
                    data: JSON.stringify({
                        id: entityId,
                        geojson: geojson,
                    }),
                    contentType: "application/json",
                    success: function (result) { },
                });
            }
        } else {
            //本地存储
            var geojson = JSON.stringify(this.getGeoJson());
            haoutil.storage.add(this.storageName, geojson);
        }
    },
    sendDeleteEntity: function (entity) {
        console.log("plot: 删除了数据")

        if (window.hasServer) {
            //后台删除
            var entityId = entity.attribute.attr.id;
            if (!entityId) { //表示绘制过程中删除
                this.isOnDraw = true;
                return;
            }
            sendAjax({
                url: "map/plot/" + entityId,
                data: JSON.stringify({}),
                type: "delete",
                contentType: "application/json",
                success: function (result) {

                },
            });
        }
        else {
            var storagedata = JSON.stringify(this.getGeoJson());
            haoutil.storage.add(this.storageName, storagedata);
        }
    },
    sendDeleteAll: function () {
        console.log("plot: 删除了所有数据")

        if (window.hasServer) {
            //后台删除
            sendAjax({
                url: "map/plot/deleteAll",
                contentType: "application/json",
                success: function (result) {

                },
            });
        }
        else {
            //本地存储
            haoutil.storage.del(this.storageName);
        }
    },



}));