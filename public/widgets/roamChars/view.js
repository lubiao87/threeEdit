var thisWidget;
var myChart1;//图表

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    myChart1 = echarts.init(document.getElementById('echartsView1'), 'dark');
    setEchartsData(thisWidget.data);

    setInterval(function () {
        updateFlyOk(thisWidget.data);
    }, 800);
}


function updateFlyOk(charsData) {
    var thislen = charsData.thislen || 0;
    var arrFlyOk = []; //已漫游 
    for (var i = 0; i < charsData.arrFxgd.length; i++) {
        if (charsData.arrLength[i] <= thislen)
            arrFlyOk.push(charsData.arrFxgd[i]);
        else
            break;
    }

    // 填入数据,根据名字对应到相应的系列
    myChart1.setOption({
        series: [{ name: '已漫游', data: arrFlyOk }]
    });

}

//飞行漫游 图表
function setEchartsData(charsData) {
    if (charsData == null || myChart1 == null) return;


    var option = {
        legend: {
            data: ['地面海拔', '漫游海拔', '已漫游']
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 10,
            containLabel: true
        },
        dataZoom: [{
            type: 'inside',
            throttle: 50
        }],
        tooltip: {
            trigger: 'axis',
            //position: function (point, params, dom, rect, size) {
            //    return [10, 20];
            //},
            formatter: function (params) {
                var inhtml = "";
                if (params.length < 2) return inhtml;

                var hbgd = params[0].value; //海拔高度
                var fxgd = params[1].value; //漫游海拔


                var point = charsData.arrPoint[params[0].dataIndex]; //所在经纬度

                inhtml += "所在位置&nbsp;" + point.x + "," + point.y + "<br />"
                    + params[1].seriesName + "&nbsp;<label style='color:" + params[1].color + ";'>" + params[1].value + "</label>&nbsp;米<br />";

                if (hbgd != 0) {
                    inhtml += params[0].seriesName + "&nbsp;<label style='color:" + params[0].color + ";'>" + params[0].value + "</label>&nbsp;米<br />";
                    var ldgd = fxgd - hbgd;//离地高度
                    inhtml += "距离地面&nbsp;<label>" + ldgd.toFixed(1) + "</label>&nbsp;米";
                    // if (charsData.arrBjgd) {
                    //     var bjgd = charsData.arrBjgd[params[0].dataIndex]; 
                    //     if (bjgd > fxgd)
                    //         inhtml += "(低于报警<label style='color:red;'>&nbsp;" + (bjgd - ldgd).toFixed(1) + "</label>&nbsp;米)";
                    // }
                }

                return inhtml;
            }
        },
        xAxis: [
            {
                name: '行程',
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                data: charsData.arrLength
            }
        ],
        yAxis: [
            {
                //name: '高度',
                type: 'value',
                axisLabel: {
                    rotate: 60,
                    formatter: '{value} 米'
                }
            }
        ],
        series: [
            {
                name: '地面海拔',
                type: 'line',
                smooth: true,
                symbol: 'none',
                sampling: 'average',
                itemStyle: {
                    normal: {
                        color: 'rgb(255, 70, 131)'
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgb(255, 158, 68)'
                        }, {
                            offset: 1,
                            color: 'rgb(255, 70, 131)'
                        }])
                    }
                },
                data: charsData.arrHbgd
            },
            {
                name: '漫游海拔',
                type: 'line',
                smooth: false,
                symbol: 'none',
                data: charsData.arrFxgd
            },
            {
                name: '已漫游',
                type: 'line',
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgb(255, 255, 0)'
                        }, {
                            offset: 1,
                            color: 'rgb(255, 255, 131)'
                        }])
                    }
                },
                data: []
            },
        ]
    };

    // if (charsData.arrBjgd) {
    //     option.legend.data.push('报警高度');
    //     option.series.push({
    //         name: '报警高度',
    //         type: 'line',
    //         smooth: false,
    //         symbol: 'none',
    //         lineStyle: {
    //             normal: {
    //                 width: 2,
    //                 type: 'dotted',
    //                 opacity: 1,
    //             }
    //         },
    //         data: charsData.arrBjgd
    //     });
    // }

    myChart1.setOption(option);
}

