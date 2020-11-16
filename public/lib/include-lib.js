/* 2017-12-7 11:57:13 | 修改 木遥（微信:  http://marsgis.cn/weixin.html ） */
//第三方类库加载管理js，方便切换lib
(function () {
    var r = new RegExp("(^|(.*?\\/))(include-lib\.js)(\\?|$)"),
        s = document.getElementsByTagName('script'), targetScript;
    for (var i = 0; i < s.length; i++) {
        var src = s[i].getAttribute('src');
        if (src) {
            var m = src.match(r);
            if (m) {
                targetScript = s[i];
                break;
            }
        }
    }

    //当前版本号,用于清理浏览器缓存
    // var cacheVersion = "20200102";

    // cssExpr 用于判断资源是否是css
    var cssExpr = new RegExp('\\.css');

    function inputLibs(list) {
        if (list == null || list.length == 0) return;

        for (var i = 0, len = list.length; i < len; i++) {
            var url = list[i];
            if (cssExpr.test(url)) {
                var css = '<link rel="stylesheet" href="' + url + '">';
                document.writeln(css);
            } else {
                var script = '<script type="text/javascript" src="' + url + '"><' + '/script>';
                document.writeln(script);
            }
        }
    }

    //加载类库资源文件
    function load() {
        var arrInclude = (targetScript.getAttribute('include') || "").split(",");
        var libpath = (targetScript.getAttribute('libpath') || "");


        //为了节省github空间，没有上传lib下面的类库到github
        //如果离线使用，可以从付费交付后的基础项目的lib目录内拷贝覆盖，并注释下面一行代码
        // libpath = "http://cesium.marsgis.cn/lib/"


        if (libpath.lastIndexOf('/') != libpath.length - 1)
            libpath += "/";

        var libsConfig = {
            'jquery': [
                libpath + "jquery/jquery-2.1.4.min.js",
            ],
            'layer': [
                libpath + "layer/theme/default/layer.css",
                libpath + "layer/theme/retina/retina.css",
                libpath + "layer/theme/mars/layer.css",
                libpath + "layer/layer.js",
            ],
            // 'okay3d': [//三维地球“主库”
            //     libpath + "cesiumjs/Cesium/Widgets/widgets.css", //cesium
            //     libpath + "cesiumjs/Cesium/Cesium.js",
            //     libpath + "cesiumjs/plugins/compatible/version.js", //cesium版本兼容处理

            //     libpath + "cesiumjs/okay3d/okay3d.css", //okay3d
            //     libpath + "cesiumjs/okay3d/okay3d.js",

            //     libpath + "cesiumjs/plugins/navigation/mars3d-navigation.css", //导航
            //     libpath + "cesiumjs/plugins/navigation/mars3d-navigation.js",

            //     // libpath + "cesiumjs/plugins/esri/mars3d-esri.js", //arcgis矢量图层扩展，无此需求时注释即可
            // ],
            'PhotoSphereViewer': [
              libpath + "PhotoSphereViewer/photo-sphere-viewer.css",
              libpath + "threejs/three.min.js",
              libpath + "threejs/controls/OrbitControls.js",
              libpath + "threejs/loaders/GLTFLoader.js",
              libpath + "uevent/browser.js",
              libpath + "PhotoSphereViewer/photo-sphere-viewer.js",
              libpath + "PhotoSphereViewer/viewer-compat.js",
            ]
        };




        for (var i in arrInclude) {
            var key = arrInclude[i];
            inputLibs(libsConfig[key]);
        }

    }

    load();
})();
