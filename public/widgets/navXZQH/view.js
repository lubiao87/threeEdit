var thisWidget;


//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }

    $("#xzqh-select").citypicker({
        simple: true,
        //province: '安徽省',
        //city: '合肥市',
        //district: '蜀山区'
    });

    var $xzqhselect = $('#xzqh-select');
    $xzqhselect.hide();//隐藏
    $xzqhselect.citypicker('open');

    var timetemp = -1;
    $(".city-picker-dropdown").on('click', '.city-select a', function () {
        var dmnm = String($xzqhselect.data('citypicker').getCode());
        var dmmc = $xzqhselect.data('citypicker').getVal();

        $("#cityname").html(dmmc);

        //调用地图定位
        if (timetemp != -1) {
            clearTimeout(timetemp);
            timetemp = -1;
        }
        timetemp = setTimeout(function () {
            centerAtRegion(dmnm, dmmc);
        }, 200);
        //调用地图定位

    });

}


//定位至指定区域
function centerAtRegion(dmnm, dmmc) {
    var jsonurl;
    var dmxh;
    if (dmnm.substring(2) == "0000") {//省
        jsonurl = "http://data.marsgis.cn/file/geojson/xzqh/sheng/china.json";
        dmxh = dmnm.substring(0, 2);
    }
    else if (dmnm.substring(4) == "00") {//市
        jsonurl = "http://data.marsgis.cn/file/geojson/xzqh/shi/" + dmnm.substring(0, 2) + ".json";
        dmxh = dmnm.substring(0, 4);
    }
    else {//县区
        jsonurl = "http://data.marsgis.cn/file/geojson/xzqh/xian/" + dmnm.substring(0, 4) + "00.json";
        dmxh = dmnm;
        $("#con_wdx_1").hide();
    }


    $.getJSON(jsonurl, function (geojson) {
        if (!thisWidget.isActivate) return;

        var length = geojson.features.length;
        for (var index = 0; index < length; index++) {
            if (geojson.features[index].properties.id == dmxh) {
                thisWidget.showRegionExtent(geojson.features[index]);
                break;
            }
        };
    });


    //显示名称
    var temp = dmmc.lastIndexOf("/");
    if (temp != -1) {
        dmmc = dmmc.substring(temp + 1);
    }
    if (dmmc.length <= 2)
        dmmc = dmmc + "&nbsp;";
    else if (dmmc.length > 3)
        dmmc = dmmc.substring(0, 2) + "..";

    $("#xzqh_sel").html(dmmc);
}

function goHome() {
    $("#cityname").html('');
    $("#xzqh-select").citypicker('reset');

    thisWidget.goHome();
}
