var thisWidget;

function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    //=================起点==================
    //输入坐标 
    $("#inputStartPoint").keypress(function (e) {
        if (e.keyCode != 13) return;
        var value = $(this).val();
        value = value.replace(/ /g, "");
        value = value.replace(/，/g, ",");
        debugger;
        if (testJWD(value)) {
            //表示输入的是经纬度
            var jwd = value.split(",");
            thisWidget.inputStartPoint(jwd[0], jwd[1]);
        } else {
            //表示输入的是地名 
            thisWidget.queryStartPoint(value);
        }
    })
    //图上选点
    $("#drawStartPoint").click(function () {
        thisWidget.drawStartPoint(function (data) {
            $("#inputStartPoint").val(data);
        });
    })


    //=================终点==================
    //输入坐标 
    $("#inputEndPoint").keypress(function (e) {
        if (e.keyCode != 13) return;
        var value = $(this).val();
        value = value.replace(/ /g, "");
        value = value.replace(/，/g, ",");
        // 104.102382 , 30.666908
        if (testJWD(value)) {
            //表示输入的是经纬度
            var jwd = value.split(",");
            thisWidget.inputEndPoint(jwd[0], jwd[1]);
        } else {
            //表示输入的是地名 
            thisWidget.queryEndPoint(value);
        }
    })
    //图上选点
    $("#drawEndPoint").click(function () {
        thisWidget.drawEndPoint(function (data) {
            $("#inputEndPoint").val(data);
        });
    })
    //修改播放速度
    $("#changeSpeed").change(function () {
        var val = $(this).val();
        thisWidget.resetSpeed(Number(val));
    });
}


//坐标校验（判断是不是在中国国界内）
function testJWD(jwdStr) {
    if (!jwdStr) return;
    var test = /^([7-9][0-9]|1[0-3][0-9])(.[0-9]{1,6})?[,，]([3-9]|[1-5][0-9])(.[0-9]{1,6})?$/;
    return test.test(jwdStr);
}

//填充搜索结果 生成下拉框
function setHtmlInMCXD(data, type) {
    if (!data || !type) return;
    var pois = data.list;
    var html = "";
    if (pois.length < 1) {
        return;
    }
    for (var i = 0; i < pois.length; i++) {
        var item = pois[i];
        var wgsLocation = item.x + "," + item.y;
        html += ' <li wgsLocation="' + wgsLocation + '" class="mcxdClass">' + item.name + '</li>';
    }
    if (type == "start") {
        var searchval_start = document.getElementById("searchval_start");
        $(searchval_start).show().html(html);
    } else {
        var searchval_end = document.getElementById("searchval_end");
        $(searchval_end).show().html(html);
    }
    var mcxdClasss = document.getElementsByClassName("mcxdClass");
    for (var i = 0; i < mcxdClasss.length; i++) {
        var ele = mcxdClasss[i];
        //绑定下拉列表的点击事件
        $(ele).off("click").on("click", function () {
            $(this).parent().hide();
            var wgsLocation = $(this).attr("wgsLocation").split(",");
            var parentId = $(this).parent().attr("id");
            if (parentId == "searchval_start") { //表示起点坐标
                thisWidget.inputStartPoint(wgsLocation[0], wgsLocation[1]);
                var mcxd_input_text = document.getElementsByClassName("mcxd_start_text")[0];
                $(mcxd_input_text).val($(this).text());
            } else { //表示终点坐标
                thisWidget.inputEndPoint(wgsLocation[0], wgsLocation[1]);
                var mcxd_input_text = document.getElementsByClassName("mcxd_end_text")[0];
                $(mcxd_input_text).val($(this).text());
            }
        });
    }
}

//清除搜索到的路线内容
function clearRouteContent() {
    var routerContent = document.getElementById("routerContent");
    if (routerContent) $(routerContent).html("");
}

function showRouteBox(res) {
    var routeBox = document.getElementById("routeBox");
    if (res == true) {
        routeBox.style.display = "block";
    } else {
        routeBox.style.display = "none";
    }

}
//widget里开始计算
function startCompute(){
    faIndex = 1;
}
//展示路线信息
var faIndex = 1;
function showRouteInfo(line) {
    if (!line || !line.attr) return;
    var path = line.attr;
    var content = "";
    content += "全长" + (path.allDistance / 1000).toFixed(3) + "公里，";
    content += "途经：";
    var roadArr = path.road;
    for (var index = 0; index < roadArr.length; index++) {
        if (index == roadArr.length - 1) {
            if (roadArr[index]) content += roadArr[index] + "。";
        } else {
            if (roadArr[index]) content += roadArr[index] + "、";
        }
    }
    var id = line.id;
    var htmlStr = '';
    var startDH_html = '<input type="button" class="router_btn startDH" lineid="' + id + '" value="开始导航" />';
    var startCK_html = '<input type="button" class="router_btn showLine" lineid="' + id + '" value="查看路线" />';
    var sj_html = '<span class="span_sjgs"><input class="sjgs" lineid="' + id + '" type="checkbox">视角跟随</span>';
    htmlStr += '<tr><td rowspan="2" class="lxh">' + faIndex + '</td>'
    htmlStr += '<td><div class="fa">';
    htmlStr += '<span>方案' + faIndex + '</span>';
    htmlStr += startDH_html;
    htmlStr += startCK_html;
    htmlStr += sj_html;
    htmlStr += '</div></td></tr>';
    htmlStr += '<tr><td>';
    htmlStr += '<p class="intro">' + content + '</p>';
    htmlStr += '</td></tr>';
    faIndex++;
    var routerContent = document.getElementById("routerContent");
    $(routerContent).append(htmlStr);
    var showLines = document.getElementsByClassName("showLine");
    var dhs = document.getElementsByClassName("startDH");
    var sjgss = document.getElementsByClassName("sjgs");
    $(showLines).off("click").on("click", function () {
        var lineId = $(this).attr("lineid");
        thisWidget.highLightLine(lineId);
    });
    $(dhs).off("click").on("click", function () {
        var lineId = $(this).attr("lineid");
        if ($(this).val() == "开始导航") {
            thisWidget.startDH(lineId, isGS);
            thisWidget.resetSpeed(Number($("#changeSpeed").val() || 120));
            $(this).next().click(); //高亮显示线
            $(this).next().next().show();
            var isGS = $(this).siblings(".span_sjgs").find(".sjgs").prop("checked");
            //开始导航的时候 记录视角
            thisWidget.getCameraView();
            $(this).val("停止导航");
        } else {
            $(this).val("开始导航");
            thisWidget.reset();
            thisWidget.setCameraView();
        }
    });
    $(sjgss).off("click").on("click", function () {
        var lineId = $(this).attr("lineid");
        var checked = $(this).prop("checked");
        if (checked) {
            thisWidget.startGS(lineId, $(this));
        } else {
            thisWidget.removeTrack();
        }
    });
}

//重置按钮
function resetButton() {
    var dhs = document.getElementsByClassName("startDH");
    var sjgss = document.getElementsByClassName("sjgs");
    $(sjgss).prop("checked", false);
    $(dhs).val("开始导航");
}