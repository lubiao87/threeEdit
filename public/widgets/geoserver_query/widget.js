/* 2017-9-28 16:04:33 | 修改 木遥（QQ：346819890） */
//此方式：弹窗非iframe模式
// import  "./QueryGeoServer.js";
okay3d.widget.bindClass(okay3d.widget.BaseWidget.extend({
  options: {
      resources: ['view.css','QueryGeoServer.js'],
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

    // console.log("baseUrl", baseUrl)

  },
  //每个窗口创建完成后调用
  winCreateOK: function (opt, result) {
    const that = this;
    this.queryMapserver = new QueryGeoServer({
        name: "公共教育设施",
        url: "http://data.marsgis.cn/geoserver/mars/wfs",
        parameters: {
            service: "WFS",
            request: "GetFeature",
            typeName: "mars:hfjy",
            version: "1.0.0",
            outputFormat: "application/json",
            maxFeatures: 200
        },
        popup: "all",
        label: {},
    });
    //框选查询   多边
    $("#drawPolygon").click(function () {
      that.clearAll();
      that.viewer.mars.draw.startDraw({
          "type": "polygon",
          "style": {
              "color": "#00FF00",
              "opacity": 0.3,
              "outline": true,
              "outlineColor": "#ffffff",
              "clampToGround": true
          },
          success: function (entity) {
            that.drawEntity = entity;
          }
      });
    });
     //框选查询 矩形
     $("#drawRectangle").click(function () {
      that.clearAll();
      that.viewer.mars.draw.startDraw({
            "type": "rectangle",
            "style": {
                "color": "#00FF00",
                "opacity": 0.3,
                "outline": true,
                "outlineColor": "#ffffff",
                "clampToGround": true
            },
            success: function (entity) {
              that.drawEntity = entity;
            }
        });
    });
    that.clearAll = function (noClearDraw) {
        $("#resultView").hide();
        that.drawEntity = null;
        that.viewer.mars.draw.clearDraw();
        that.viewer.mars.popup.close();
        if (that.dataSource) {
          that.viewer.dataSources.remove(that.dataSource);
          that.dataSource = null;
        }
    }
    $("#clearDraw").click(function () {
      that.clearAll();
    });
    $("#query").click(function () {
      that.queryData();
    });


    $table = $('#tableLB');
    // console.log("$", $);
    that.queryData = function () {
        var queryVal = $.trim($("#queryText").val());

        if (that.dataSource) {
            viewer.dataSources.remove(that.dataSource);
            that.dataSource = null;
        }

        that.queryMapserver.query({
            column: "项目名称",
            text: queryVal,
            fwEntity: that.drawEntity,
            success: (result) => {
                if (result.list == null) {
                    haoutil.msg("未查询到相关记录！");
                    return;
                }

                if (that.dataSource) {
                    viewer.dataSources.remove(that.dataSource);
                }
                that.dataSource = result.dataSource;
                viewer.dataSources.add(that.dataSource);

                $table.bootstrapTable("load", result.list);
                $("#resultView").show();
                haoutil.msg("共查询到 " + result.count + " 条记录！");

            },
            error: (error, msg) => {
                console.log(error);
                haoutil.alert(msg, "服务访问错误");
            },
        })


    };
    $table.bootstrapTable({
        singleSelect: true, //单选
        iconsPrefix: 'fa',

        pagination: true,
        showPaginationSwitch: false,
        pageNumber: 1,
        pageSize: 5,
        pageList: [5, 10, 20, 50, 100],

        columns: [
            {
                title: '',//序号
                sortable: false,
                align: 'center',
                width: 50,
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: 'name',
                title: '名称',
                sortable: true,
                width: 100,
            },
            {
                field: '设施类型',
                title: '类型',
                sortable: true,
                align: 'center',
                width: 70,
            },
            {
                field: '具体位置',
                title: '地址',
                sortable: true,
                formatter: function (value, row) {
                    if (value)
                        return value;
                    else
                        return "";
                }
            }
        ],
        onClickRow: function (item, $element, field) {
            var entity = item._entity;
            if (entity == null) {
                alert(item.name + " 无经纬度坐标信息！");
                return;
            }
            that.viewer.mars.flyTo(entity);
        }
    });
  },
  //激活插件
  activate: function () {
    // document.getElementById('geoserverLb').style.display='block';
  },
  //释放插件
  disable: function () {


  },




}));
