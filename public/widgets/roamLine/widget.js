/* 2017-12-6 11:11:44 | 修改 木遥（QQ：346819890） */
//模块：
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
    options: {
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
    //初始化[仅执行1次]
    create: function () {

        this.drawControl = new okay3d.Draw(this.viewer, {
            hasEdit: true
        });

        //事件监听
        var that = this;
        this.drawControl.on(okay3d.draw.event.DrawCreated, function (e) {
            // var entity = e.entity;
            // if (entity._attribute.attr.id == null || entity._attribute.attr.id == "")
            //     entity._attribute.attr.id = (new Date()).format("MMddHHmmss");
            if (that.viewWindow)
                that.viewWindow.plotlist.plotEnd();
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
            that.saveEntity(entity);
        });

        this.getList();
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {
        this.drawControl.hasEdit(true);
        this.drawControl.setVisible(true);
    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
        this.drawControl.stopDraw();

        if (this.lastEditEntity) {
            this.lastEditEntity._polyline.show = false;
            this.lastEditEntity._attribute.style.show = false;
            this.lastEditEntity = null;
        }

        this.drawControl.hasEdit(false);
        this.drawControl.setVisible(false);
    },

    //开始标记
    startDraw: function (defval) {
        //编辑时只显示本身路线，其他路线隐藏
        if (this.lastEditEntity) {
            this.lastEditEntity._polyline.show = false;
            this.lastEditEntity._attribute.style.show = false;
            this.lastEditEntity = null;
        }

        //console.log(JSON.stringify(defval));
        this.drawControl.startDraw(defval);
    },
    startEditingById: function (id) {
        var entity = this.drawControl.getEntityById(id);
        if (entity == null) return;

        this.viewer.flyTo(entity);

        this.drawControl.startEditing(entity);
    },
    lastEditEntity: null,
    startEditing: function (entity) {

        //编辑时只显示本身路线，其他路线隐藏
        if (this.lastEditEntity) {
            this.lastEditEntity._polyline.show = false;
            this.lastEditEntity._attribute.style.show = false;
            this.lastEditEntity = null;
        }
        this.lastEditEntity = entity;

        entity._polyline.show = true;
        entity._attribute.style.show = true;

        var lonlats = this.drawControl.getCoordinates(entity);
        this.viewWindow.plotEdit.startEditing(entity.attribute, lonlats);
    },
    stopEditing: function (layer) {
        if (this.viewWindow)
            this.viewWindow.plotEdit.stopEditing();
    },
    stopDraw: function () {
        this.drawControl.stopDraw();
    },
    //更新图上的属性
    updateAttr2map: function (attr) {
        this.drawControl.updateAttribute(attr);
    },
    //更新图上的几何形状、坐标等
    updateGeo2map: function (coords, withHeight) {
        var positions = [];
        if (withHeight) {
            for (var i = 0; i < coords.length; i += 3) {
                var point = Cesium.Cartesian3.fromDegrees(coords[i], coords[i + 1], coords[i + 2]);
                positions.push(point);
            }
        } else {
            for (var i = 0; i < coords.length; i += 2) {
                var point = Cesium.Cartesian3.fromDegrees(coords[i], coords[i + 1], 0);
                positions.push(point);
            }
        }
        this.drawControl.setPositions(positions);

        if (positions.length <= 3) {
            this.centerCurrentEntity();
        }

        return positions;
    },
    centerCurrentEntity: function () {
        var entity = this.drawControl.getCurrentEntity();
        if (entity == null) return;
        this.viewer.flyTo(entity);
    },
    //文件处理
    getGeoJson: function () {
        return this.drawControl.toGeoJSON();
    },
    jsonToLayer: function (json, isClear, isFly) {
        if (json == null) return;

        return this.drawControl.loadJson(json, {
            clear: isClear,
            flyTo: isFly
        });
    },
    deleteAll: function () {
        this.drawControl.deleteAll();
        this.deleteAllData();
    },
    deleteEntity: function (id) {
        var entity = this.drawControl.getEntityById(id);
        if (entity == null) return;

        this.delEntity(id);
        this.drawControl.deleteEntity(entity);
    },
    deleteCurrentEntity: function () {
        var entity = this.drawControl.getCurrentEntity();
        if (entity == null) return;

        this.delEntity(entity._attribute.attr.id);
        this.drawControl.deleteEntity(entity);
    },
    hasEdit: function (val) {
        this.drawControl.hasEdit(val);
    },

    //数据保存处理
    storageName: "marsgis_roam",
    arrFlyTable: [],
    getList: function () {
        var that = this;
        if (window.hasServer) {
            //后台接口查询
            sendAjax({
                url: "v1/map/flyroute/list",
                data: {
                    userId : haoutil.storage.get("userId")
                },
                type: "get",
                dataType: "json",
                contentType: "application/x-www-form-urlencoded",
                success: function (result) {
                    for (var i = 0; i < result.length; i++) {
                        var geojson = JSON.parse(result[i].geojson);
                        geojson.id = result[i].id;
                        that.arrFlyTable.push(geojson);
                    }
                    var entities = that.showData(that.arrFlyTable);

                    if (that.viewWindow)
                        that.viewWindow.tableWork.loadData(that.arrFlyTable);
                },
            });
        } else {
            //本地缓存
            var laststorage = haoutil.storage.get(this.storageName); //读取localStorage值
            if (laststorage != null)
                this.arrFlyTable = eval(laststorage);

            if (this.arrFlyTable == null || this.arrFlyTable.length == 0) {
                this.arrFlyTable = [];

                var that = this;
                $.getJSON(this.path + "data/fly.json", function (result) {

                    that.arrFlyTable = that.arrFlyTable.concat(result);
                    that.showData(that.arrFlyTable);
                    if (that.viewWindow)
                        that.viewWindow.tableWork.loadData(that.arrFlyTable);
                });
            } else {
                this.showData(this.arrFlyTable);
                if (this.viewWindow)
                    this.viewWindow.tableWork.loadData(this.arrFlyTable);
            }
        }


    },
    showData: function (arr) { //加载历史保存数据
        var arrjson = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
           if(item.properties.style) item.properties.style.show = false;
            var json = {
                type: "Feature",
                properties: item.properties,
                geometry: item.geometry
            };
            json.properties.attr.id = item.id;
            json.properties.attr.name = item.name;

            arrjson.push(json);
        }
        var entities = this.drawControl.loadJson({
            type: "FeatureCollection",
            features: arrjson
        }, {
            clear: true,
            flyTo: false
        });
        return entities;
    },
    deleteAllData: function () {
        this.arrFlyTable = [];
        haoutil.storage.add(this.storageName, JSON.stringify(this.arrFlyTable));
        if (this.isActivate && this.viewWindow != null)
            this.viewWindow.tableWork.loadData(this.arrFlyTable);
    },
    isOnDraw: false,
    delEntity: function (id) {
        if (!id) {
            this.isOnDraw = true; //绘制过程中删除
            return;
        };
        this.drawControl.stopDraw();
        if (window.hasServer) {
            sendAjax({
                url: "v1/map/flyroute/" + id,
                type: "delete",
                dataType: "json",
                contentType: "application/json",
                success: function (result) {
                    console.log("删除漫游路线成功，返回数据：" + JSON.stringify(result));
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("服务出错：" + XMLHttpRequest.statusText + "，代码 " + XMLHttpRequest.status);
                },
            });
        }
        for (var index = this.arrFlyTable.length - 1; index >= 0; index--) {
            if (this.arrFlyTable[index].id == id) {
                this.arrFlyTable.splice(index, 1);
                break;
            }
        }
        haoutil.storage.add(this.storageName, JSON.stringify(this.arrFlyTable));
        if (this.isActivate && this.viewWindow != null)
            this.viewWindow.tableWork.loadData(this.arrFlyTable);
    },

    saveEntity: function (entity) {
        if (this.isOnDraw) { //绘制过程中删除
            this.isOnDraw = false;
            return;
        }
        var that = this;
        var random = (new Date()).format("MMddHHmmss");
        var noId = false;
        if (entity._attribute.attr.id == null || entity._attribute.attr.id == "") {
            noId = true;
            entity._attribute.attr.id = random;
        }
        if (entity._attribute.attr.name == null || entity._attribute.attr.name == "")
            entity._attribute.attr.name = '路线' + random;
        var json = this.drawControl.toGeoJSON(entity);
        if (json.geometry.coordinates.length < 2) { //路线点数小于2个
            return;
        }
        var item = {
            id: json.properties.attr.id,
            name: json.properties.attr.name,
            geometry: json.geometry,
            properties: json.properties,
        };

        if (window.hasServer) {
            //后台接口
            //新增
            item = JSON.stringify(item);
            if (noId) {
                sendAjax({
                    url: "v1/map/flyroute/add",
                    data: JSON.stringify({
                        name: entity._attribute.attr.name, //名称
                        geojson: item, //genjson
                        remark: entity._attribute.attr.remark, //备注
                    }),
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        entity._attribute.attr.id = data.id;
                        item = JSON.parse(item);
                        item.id = data.id; //同步table内标签的id
                        that.arrFlyTable.push(item);

                        if (that.isActivate && that.viewWindow != null)
                            that.viewWindow.tableWork.loadData(that.arrFlyTable);
                    }
                });
            } else {
                //修改
                sendAjax({
                    url: "v1/map/flyroute/update",
                    data: JSON.stringify({
                        name: entity._attribute.attr.name, //名称
                        geojson: item, //genjson
                        id: entity._attribute.attr.id,
                        remark: entity._attribute.attr.remark, //备注
                    }),
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (result) {
                        console.log("修改漫游成功，返回数据：" + JSON.stringify(result));
                    }
                });
            }
        } else {
            //保存到本地缓存
            var isFind = false;
            for (var index = this.arrFlyTable.length - 1; index >= 0; index--) {
                if (this.arrFlyTable[index].id == item.id) {
                    isFind = true;
                    this.arrFlyTable[index] = item;
                    break;
                }
            }
            if (!isFind)
                this.arrFlyTable.push(item);
            haoutil.storage.add(this.storageName, JSON.stringify(this.arrFlyTable));
            if (this.isActivate && this.viewWindow != null)
                this.viewWindow.tableWork.loadData(this.arrFlyTable);
        }


    },
    toRoamFly: function (lineData) {
        var data = this.getFormatData(lineData);

        okay3d.widget.activate({
            uri: 'widgets/roamFly/widget.js',
            data: data
        });
    },
    saveForGeoJson: function (lineData) {
        var data = this.getFormatData(lineData);
        haoutil.file.downloadFile(data.name + ".json", JSON.stringify(data));
    },
    //保存为czml
    saveForCzml: function (lineData) {
        if (lineData.geometry.coordinates.length < 2) {
            toastr.error('路线无坐标数据，无法生成！');
            return;
        }
        var data = this.getFormatData(lineData);
        var line = new okay3d.FlyLine(this.viewer, data);
        var czml = JSON.stringify(line.toCZML());
        line.destroy();

        haoutil.file.downloadFile(lineData.properties.attr.name + ".czml", czml);
    },
    //转为flyLine需要的参数格式
    getFormatData: function (lineData) {
        var attr = lineData.properties.attr;
        var data = {
            id: attr.id,
            name: attr.name,
            remark: attr.remark,
            clockLoop: attr.clockLoop,
            camera: {
                type: attr.cameraType,
                followedX: attr.followedX,
                followedZ: attr.followedZ,
            },
            showGroundHeight: attr.showGroundHeight,
            clampToGround: attr.clampToGround,
            interpolation: attr.interpolation,  //setInterpolationOptions插值

            points: lineData.geometry.coordinates,
            speed: lineData.properties.speed,

            model: this.getModelCfg(attr.model),
        };

        if (attr.showLabel) {
            data.label = {
                show: true
            };
        }
        if (attr.showLine) {
            data.path = lineData.properties.style
            data.path.show = true;
        }
        if (attr.showShadow) {
            data.shadow = {
                show: true,
                type: attr.shadowType
            }
        }
        return data;
    },
    getModelCfg: function (model) {
        //漫游对象
        switch (model) {
            case "model_car": //汽车模型
                return {
                    show: true,
                        uri: 'http://data.marsgis.cn/gltf/mars/qiche.gltf',
                        scale: 0.2,
                        minimumPixelSize: 50
                };
                break;
            case "model_air": //民航飞机模型
                return {
                    show: true,
                        uri: 'http://data.marsgis.cn/gltf/mars/feiji.glb',
                        scale: 0.1,
                        minimumPixelSize: 50
                };
                break;
            case "model_zhanji": //军用飞机模型
                return {
                    show: true,
                        uri: 'http://data.marsgis.cn/gltf/mars/zhanji.glb',
                        scale: 0.01,
                        minimumPixelSize: 50
                };
                break;
            case "model_weixin": //卫星模型
                return {
                    show: true,
                        uri: 'http://data.marsgis.cn/gltf/mars/weixin.gltf',
                        scale: 1,
                        minimumPixelSize: 100
                };
                break;
        }
        return {
            show: false
        };
    }



}));