/* MVT加载类 作者： 木遥（QQ：346819890） */
(function (window) {

    function MvtImageryProvider(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        this.options = options;

        this._tileWidth = Cesium.defaultValue(options.tileWidth, 512);
        this._tileHeight = Cesium.defaultValue(options.tileHeight, 512);
        this._minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
        this._maximumLevel = Cesium.defaultValue(options.maximumLevel, 18);


        if (options.rectangle && options.rectangle.xmin && options.rectangle.xmax && options.rectangle.ymin && options.rectangle.ymax) {
            var xmin = options.rectangle.xmin;
            var xmax = options.rectangle.xmax;
            var ymin = options.rectangle.ymin;
            var ymax = options.rectangle.ymax;
            options.rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
        }
        this._tilingScheme = Cesium.defaultValue(options.tilingScheme, new Cesium.WebMercatorTilingScheme({ ellipsoid: options.ellipsoid }));
        this._rectangle = Cesium.defaultValue(options.rectangle, this._tilingScheme.rectangle);
        this._rectangle = Cesium.Rectangle.intersection(this._rectangle, this._tilingScheme.rectangle);
        this._hasAlphaChannel = Cesium.defaultValue(options.hasAlphaChannel, true);

        this._errorEvent = new Cesium.Event();
        this._readyPromise = Cesium.when.resolve(true);
        this._credit = undefined;
        this._ready = true;

        //mvt相关的处理
        if (!window.ol) {
            throw new DeveloperError('请引入Openlayers类库！');
        }
        this._ol = window.ol;
        this._mvtParser = new this._ol.format.MVT();

        this._styleClass = options.style;
        this._key = Cesium.defaultValue(options.key, "");
        this._url = Cesium.defaultValue(options.url, "");

        var sw = this._tilingScheme._rectangleSouthwestInMeters;
        var ne = this._tilingScheme._rectangleNortheastInMeters;
        var mapExtent = [sw.x, sw.y, ne.x, ne.y];
        this._resolutions = ol.tilegrid.resolutionsFromExtent(mapExtent, this._maximumLevel, this._tileWidth);

        this._pixelRatio = 1;
        this._transform = [0.125, 0, 0, 0.125, 0, 0];
        this._replays = ["Default", "Image", "Polygon", "LineString", "Text"];

        this._tileQueue = new Cesium.TileReplacementQueue();
        this._cacheSize = 1000;
    }

    Object.defineProperties(MvtImageryProvider.prototype, {
        proxy: {
            get: function () {
                return undefined;
            }
        },

        tileWidth: {
            get: function () {
                return this._tileWidth;
            }
        },

        tileHeight: {
            get: function () {
                return this._tileHeight;
            }
        },

        maximumLevel: {
            get: function () {
                return undefined;
            }
        },

        minimumLevel: {
            get: function () {
                return undefined;
            }
        },

        tilingScheme: {
            get: function () {
                return this._tilingScheme;
            }
        },

        rectangle: {
            get: function () {
                return this._tilingScheme.rectangle;
            }
        },

        tileDiscardPolicy: {
            get: function () {
                return undefined;
            }
        },

        errorEvent: {
            get: function () {
                return this._errorEvent;
            }
        },

        ready: {
            get: function () {
                return true;
            }
        },

        readyPromise: {
            get: function () {
                return this._readyPromise;
            }
        },

        credit: {
            get: function () {
                return undefined;
            }
        },

        hasAlphaChannel: {
            get: function () {
                return true;
            }
        }
    });

    MvtImageryProvider.prototype.getTileCredits = function (x, y, level) {
        return undefined;
    };

    MvtImageryProvider.prototype.pickFeatures = function (x, y, level, longitude, latitude) {
        return undefined;
    };

    MvtImageryProvider.prototype.requestImage = function (x, y, level, request) {
        var cacheTile = findTileInQueue(x, y, level, this._tileQueue);
        if (cacheTile != undefined) {
            return cacheTile;
        }
        else {
            var that = this;
            var url = this._url;

            var reverseY = this._tilingScheme.getNumberOfYTilesAtLevel(level) - y - 1;
            url = url.replace('{x}', x).replace('{y}', y).replace('{reverseY}', reverseY).replace('{z}', level).replace('{k}', this._key);

            var resource = Cesium.Resource.createIfNeeded(url);
            return resource.fetchArrayBuffer().then(function (arrayBuffer) {

                var canvas = document.createElement('canvas');
                canvas.width = that._tileWidth;
                canvas.height = that._tileHeight;
                var vectorContext = canvas.getContext('2d');

                var features = that._mvtParser.readFeatures(arrayBuffer);

                var styleFun = that._styleClass.getStyle();

                var extent = [0, 0, 4096, 4096];
                var _replayGroup = new ol.render.canvas.ReplayGroup(0, extent,
                    8, true, 100);

                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    var styles = styleFun(features[i], that._resolutions[level]);
                    for (var j = 0; j < styles.length; j++) {
                        ol.renderer.vector.renderFeature_(_replayGroup, feature, styles[j], 16);
                    }
                }
                _replayGroup.finish();

                _replayGroup.replay(vectorContext, that._pixelRatio, that._transform, 0, {}, that._replays, true);
                if (that._tileQueue.count > that._cacheSize) {
                    trimTiles(that._tileQueue, that._cacheSize / 2);
                }

                canvas.xMvt = x;
                canvas.yMvt = y;
                canvas.zMvt = level;
                that._tileQueue.markTileRendered(canvas);

                delete _replayGroup;
                _replayGroup = null;

                return canvas;
            }).otherwise(function (error) {
                return undefined;
            });
        }
    };

    function findTileInQueue(x, y, level, tileQueue) {
        var item = tileQueue.head;
        while (item != undefined && !(item.xMvt == x && item.yMvt == y && item.zMvt == level)) {
            item = item.replacementNext;
        }
        return item;
    };

    function removeQueue(tileReplacementQueue, item) {
        var previous = item.replacementPrevious;
        var next = item.replacementNext;

        if (item === tileReplacementQueue._lastBeforeStartOfFrame) {
            tileReplacementQueue._lastBeforeStartOfFrame = next;
        }

        if (item === tileReplacementQueue.head) {
            tileReplacementQueue.head = next;
        } else {
            previous.replacementNext = next;
        }

        if (item === tileReplacementQueue.tail) {
            tileReplacementQueue.tail = previous;
        } else {
            next.replacementPrevious = previous;
        }

        item.replacementPrevious = undefined;
        item.replacementNext = undefined;

        --tileReplacementQueue.count;
    }

    function trimTiles(tileQueue, maximumTiles) {
        var tileToTrim = tileQueue.tail;
        while (tileQueue.count > maximumTiles &&
            Cesium.defined(tileToTrim)) {
            var previous = tileToTrim.replacementPrevious;

            removeQueue(tileQueue, tileToTrim);
            delete tileToTrim;
            tileToTrim = null;

            tileToTrim = previous;
        }
    };


    //=========================官方mapbox-streets-v6 vector样式==================

    // Styles for the mapbox-streets-v6 vector tile data set. Loosely based on
    // http://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6.json
    function MapboxStreetsV6MvtStyle(options) {
    }
    MapboxStreetsV6MvtStyle.prototype.getStyle = function () {
        var fill = new ol.style.Fill({ color: '' });
        var stroke = new ol.style.Stroke({ color: '', width: 1 });
        var polygon = new ol.style.Style({ fill: fill });
        var strokedPolygon = new ol.style.Style({ fill: fill, stroke: stroke });
        var line = new ol.style.Style({ stroke: stroke });
        var text = new ol.style.Style({
            text: new ol.style.Text({
                text: '', fill: fill, stroke: stroke
            })
        });
        var iconCache = {};
        function getIcon(iconName) {
            var icon = iconCache[iconName];
            if (!icon) {
                icon = new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'https://unpkg.com/@mapbox/maki@4.0.0/icons/' + iconName + '-15.svg',
                        imgSize: [15, 15]
                    })
                });
                iconCache[iconName] = icon;
            }
            return icon;
        }
        var styles = [];
        return function (feature, resolution) {
            var length = 0;
            var layer = feature.get('layer');
            var cls = feature.get('class');
            var type = feature.get('type');
            var scalerank = feature.get('scalerank');
            var labelrank = feature.get('labelrank');
            var adminLevel = feature.get('admin_level');
            var maritime = feature.get('maritime');
            var disputed = feature.get('disputed');
            var maki = feature.get('maki');
            var geom = feature.getGeometry().getType();
            if (layer == 'landuse' && cls == 'park') {
                fill.setColor('#d8e8c8');
                styles[length++] = polygon;
            } else if (layer == 'landuse' && cls == 'cemetery') {
                fill.setColor('#e0e4dd');
                styles[length++] = polygon;
            } else if (layer == 'landuse' && cls == 'hospital') {
                fill.setColor('#fde');
                styles[length++] = polygon;
            } else if (layer == 'landuse' && cls == 'school') {
                fill.setColor('#f0e8f8');
                styles[length++] = polygon;
            } else if (layer == 'landuse' && cls == 'wood') {
                fill.setColor('rgb(233,238,223)');
                styles[length++] = polygon;
            } else if (layer == 'waterway' &&
                cls != 'river' && cls != 'stream' && cls != 'canal') {
                stroke.setColor('#a0c8f0');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'waterway' && cls == 'river') {
                stroke.setColor('#a0c8f0');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'waterway' && (cls == 'stream' ||
                cls == 'canal')) {
                stroke.setColor('#a0c8f0');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'water') {
                fill.setColor('#a0c8f0');
                styles[length++] = polygon;
            } else if (layer == 'aeroway' && geom == 'Polygon') {
                fill.setColor('rgb(242,239,235)');
                styles[length++] = polygon;
            } else if (layer == 'aeroway' && geom == 'LineString' &&
                resolution <= 76.43702828517625) {
                stroke.setColor('#f0ede9');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'building') {
                fill.setColor('#f2eae2');
                stroke.setColor('#dfdbd7');
                stroke.setWidth(1);
                styles[length++] = strokedPolygon;
            } else if (layer == 'tunnel' && cls == 'motorway_link') {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'tunnel' && cls == 'service') {
                stroke.setColor('#cfcdca');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'tunnel' &&
                (cls == 'street' || cls == 'street_limited')) {
                stroke.setColor('#cfcdca');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'tunnel' && cls == 'main' &&
                resolution <= 1222.99245256282) {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'tunnel' && cls == 'motorway') {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'tunnel' && cls == 'path') {
                stroke.setColor('#cba');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'tunnel' && cls == 'major_rail') {
                stroke.setColor('#bbb');
                stroke.setWidth(2);
                styles[length++] = line;
            } else if (layer == 'road' && cls == 'motorway_link') {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'road' && (cls == 'street' ||
                cls == 'street_limited') && geom == 'LineString') {
                stroke.setColor('#cfcdca');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'road' && cls == 'main' &&
                resolution <= 1222.99245256282) {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'road' && cls == 'motorway' &&
                resolution <= 4891.96981025128) {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'road' && cls == 'path') {
                stroke.setColor('#cba');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'road' && cls == 'major_rail') {
                stroke.setColor('#bbb');
                stroke.setWidth(2);
                styles[length++] = line;
            } else if (layer == 'bridge' && cls == 'motorway_link') {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'bridge' && cls == 'motorway') {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'bridge' && cls == 'service') {
                stroke.setColor('#cfcdca');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'bridge' &&
                (cls == 'street' || cls == 'street_limited')) {
                stroke.setColor('#cfcdca');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'bridge' && cls == 'main' &&
                resolution <= 1222.99245256282) {
                stroke.setColor('#e9ac77');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'bridge' && cls == 'path') {
                stroke.setColor('#cba');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'bridge' && cls == 'major_rail') {
                stroke.setColor('#bbb');
                stroke.setWidth(2);
                styles[length++] = line;
            } else if (layer == 'admin' && adminLevel >= 3 && maritime === 0) {
                stroke.setColor('#9e9cab');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'admin' && adminLevel == 2 &&
                disputed === 0 && maritime === 0) {
                stroke.setColor('#9e9cab');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'admin' && adminLevel == 2 &&
                disputed === 1 && maritime === 0) {
                stroke.setColor('#9e9cab');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'admin' && adminLevel >= 3 && maritime === 1) {
                stroke.setColor('#a0c8f0');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'admin' && adminLevel == 2 && maritime === 1) {
                stroke.setColor('#a0c8f0');
                stroke.setWidth(1);
                styles[length++] = line;
            } else if (layer == 'country_label' && scalerank === 1) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('bold 11px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#334');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(2);
                styles[length++] = text;
            } else if (layer == 'country_label' && scalerank === 2 &&
                resolution <= 19567.87924100512) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('bold 10px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#334');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(2);
                styles[length++] = text;
            } else if (layer == 'country_label' && scalerank === 3 &&
                resolution <= 9783.93962050256) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('bold 9px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#334');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(2);
                styles[length++] = text;
            } else if (layer == 'country_label' && scalerank === 4 &&
                resolution <= 4891.96981025128) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('bold 8px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#334');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(2);
                styles[length++] = text;
            } else if (layer == 'marine_label' && labelrank === 1 &&
                geom == 'Point') {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont(
                    'italic 11px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#74aee9');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'marine_label' && labelrank === 2 &&
                geom == 'Point') {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont(
                    'italic 11px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#74aee9');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'marine_label' && labelrank === 3 &&
                geom == 'Point') {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont(
                    'italic 10px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#74aee9');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'marine_label' && labelrank === 4 &&
                geom == 'Point') {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont(
                    'italic 9px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#74aee9');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'place_label' && type == 'city' &&
                resolution <= 1222.99245256282) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('11px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#333');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'place_label' && type == 'town' &&
                resolution <= 305.748113140705) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('9px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#333');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'place_label' && type == 'village' &&
                resolution <= 38.21851414258813) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('8px "Open Sans", "Arial Unicode MS"');
                fill.setColor('#333');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'place_label' &&
                resolution <= 19.109257071294063 && (type == 'hamlet' ||
                    type == 'suburb' || type == 'neighbourhood')) {
                text.getText().setText(feature.get('name_en'));
                text.getText().setFont('bold 9px "Arial Narrow"');
                fill.setColor('#633');
                stroke.setColor('rgba(255,255,255,0.8)');
                stroke.setWidth(1);
                styles[length++] = text;
            } else if (layer == 'poi_label' && resolution <= 19.109257071294063 &&
                scalerank == 1 && maki !== 'marker') {
                styles[length++] = getIcon(maki);
            } else if (layer == 'poi_label' && resolution <= 9.554628535647032 &&
                scalerank == 2 && maki !== 'marker') {
                styles[length++] = getIcon(maki);
            } else if (layer == 'poi_label' && resolution <= 4.777314267823516 &&
                scalerank == 3 && maki !== 'marker') {
                styles[length++] = getIcon(maki);
            } else if (layer == 'poi_label' && resolution <= 2.388657133911758 &&
                scalerank == 4 && maki !== 'marker') {
                styles[length++] = getIcon(maki);
            } else if (layer == 'poi_label' && resolution <= 1.194328566955879 &&
                scalerank >= 5 && maki !== 'marker') {
                styles[length++] = getIcon(maki);
            }
            styles.length = length;
            return styles;
        };
    }

    //=========================自定义的Sld 样式==================
    // sld与mvt样式区别：sld针对一个要素多个rule的样式可以同时独立生效，而mvt只能给一个要素设置一个样式

    function MvtSldStyle(options) {
        this.ol = null;
        this.json = {};
        this.options = {};
        this.style = {};
        this.iconCache = {};
        this.properties = null;
        this.type = null;
        this.scale = null;
        this.resolution = null;
        this.filterIsPass = null;
        this.scaleIsPass = true;
        this.init(options);
    }

    MvtSldStyle.prototype = {
        constructor: MvtSldStyle,

        defaults: {
            ol: null,
            json: {}
        },

        init: function (options) {
            let opts = Object.assign({}, this.defaults, options);
            this.json = opts.json;
            this.ol = opts.ol;
        },

        reset: function () {
            this.options = {};
            this.style = {};
            this.properties = null;
            this.type = null;
            this.scale = null;
            this.resolution = null;
            this.filterIsPass = null;
            this.scaleIsPass = true;
        },

        getStyle: function () {
            let This = this;
            return function (feature, resolution) {
                This.reset();
                This.type = feature.getGeometry().getType();
                This.properties = feature.getProperties();
                This.resolution = resolution;
                This.scale = 1 / (0.0254 / (96 * resolution));
                This.filter();
                return This.buildStyle();
            }
        },

        // 根据options组装最终的样式对象
        buildStyle: function () {
            if (Object.keys(this.options).length == 0) return [new this.ol.style.Style({})];
            // if (JSON.stringify(this.options) == '{}') return;

            // 组装基础样式
            switch (this.type.toLowerCase()) {
                case 'point':
                    if (this.options.image.imageStyle) this.style.image = this.options.image.imageStyle;
                    break;

                case 'linestring':
                    if (this.options.stroke) this.style.stroke = this.options.stroke;
                    break;

                case 'polygon':
                    if (this.options.fill) this.style.fill = this.options.fill;
                    if (this.options.stroke) this.style.stroke = this.options.stroke;
                    break;

                default:
                    break;
            }

            // 组装label样式,这里控制了下显示层级，只有分辨率小于40的时候才会显示label，后续可以做成可配置项
            if (this.resolution < 40 && this.options.text) {
                this.style.text = new this.ol.style.Text({
                    text: this.options.text.text ? this.options.text.text + '' : '',
                    textBaseline: "top",
                    overflow: 'line',
                    font: `${this.options.text.font || 10}px sans-serif`,
                    offsetX: this.options.text.offsetX,
                    offsetY: this.options.text.offsetY,
                    fill: this.options.text.fill,
                    stroke: this.options.text.stroke,
                    rotateWithView: false
                })
            }

            // 组装层级样式
            this.style.zIndex = this.options.zIndex || 1;
            return [new this.ol.style.Style(this.style)];
        },

        // 构建样式options
        buildOptions: function (rule) {
            // rule.Symbolizer.WellKnownName = 'img';
            // rule.Symbolizer.src = 'https://unpkg.com/@mapbox/maki@4.0.0/icons/park-15.svg';

            this.options.image = {};
            this.options.image.rotation = rule.Symbolizer.Rotation || 0;

            if (rule.Symbolizer.FillColor && rule.Symbolizer.WellKnownName != 'img') {
                let imgFillColor = this.buildRgba(rule.Symbolizer.FillColor, rule.Symbolizer.FillOpacity);
                this.options.image.fill = new this.ol.style.Fill({
                    color: imgFillColor
                });

                if (rule.Symbolizer.StrokeColor) {
                    let imgStrokeColor = this.buildRgba(rule.Symbolizer.StrokeColor, rule.Symbolizer.StrokeOpacity);
                    this.options.image.stroke = new this.ol.style.Stroke({
                        color: imgStrokeColor,
                        width: rule.Symbolizer.StrokeWidth,
                        lineDash: rule.Symbolizer.StrokeDasharray.split(' ')
                    });
                }
            }

            this.options.image.render = "image";

            switch (rule.Symbolizer.WellKnownName) {
                case 'circle':
                    // 圆形
                    this.options.image.radius = rule.Symbolizer.Size;
                    this.options.image.imageStyle = new this.ol.style.Circle(this.options.image);
                    break;

                case 'square':
                    // 正方形
                    this.options.image.radius = rule.Symbolizer.Size;
                    this.options.image.points = 4;
                    this.options.image.angle = Math.PI / 4;
                    this.options.image.imageStyle = new this.ol.style.RegularShape(this.options.image);
                    break;

                case 'triangle':
                    // 三角形
                    this.options.image.radius = rule.Symbolizer.Size;
                    this.options.image.points = 3;
                    this.options.image.angle = 0;
                    this.options.image.imageStyle = new this.ol.style.RegularShape(this.options.image);
                    break;

                case 'star':
                    // 五角形
                    this.options.image.radius = rule.Symbolizer.Size;
                    this.options.image.points = 5;
                    this.options.image.radius2 = rule.Symbolizer.Size / 2.5;
                    this.options.image.angle = 0;
                    this.options.image.imageStyle = new this.ol.style.RegularShape(this.options.image);
                    break;

                case 'cross':
                    // 十字架
                    this.options.image.radius = rule.Symbolizer.Size;
                    this.options.image.points = 4;
                    this.options.image.radius2 = 0;
                    this.options.image.angle = 0;
                    this.options.image.imageStyle = new this.ol.style.RegularShape(this.options.image);
                    break;

                case 'x':
                    // ×形
                    this.options.image.radius = rule.Symbolizer.Size;
                    this.options.image.points = 4;
                    this.options.image.radius2 = 0;
                    this.options.image.angle = Math.PI / 4;
                    this.options.image.imageStyle = new this.ol.style.RegularShape(this.options.image);
                    break;

                case 'img':
                    let icon = this.iconCache[rule.Symbolizer.src];
                    if (!icon) {
                        this.options.image.src = rule.Symbolizer.src;
                        this.options.image.anchorXUnits = 'fraction';
                        this.options.image.anchorYUnits = 'fraction';
                        this.options.image.anchor = [0.5, 0.5];
                        this.options.image.offset = [0, 0];
                        this.options.image.scale = 1;
                        this.options.image.rotation = rule.Symbolizer.Rotation;
                        this.options.image.crossOrigin = 'anonymous',
                            this.options.image.imageStyle = new this.ol.style.Icon(this.options.image);
                        this.iconCache[rule.Symbolizer.src] = this.options.image.imageStyle;
                    } else {
                        this.options.image.imageStyle = icon;
                    }
                    break;

                default:
                    break;
            }

            // 构建option中的填充色
            if (rule.Symbolizer.FillColor) {
                let fillColor = this.buildRgba(rule.Symbolizer.FillColor, rule.Symbolizer.FillOpacity);
                this.options.fill = new this.ol.style.Fill({
                    color: fillColor
                });
            }

            // 构建option中的边框
            let strokeColor, strokeWidth, strokeDasharray;
            if (rule.Symbolizer.StrokeColor) {
                strokeColor = this.buildRgba(rule.Symbolizer.StrokeColor, rule.Symbolizer.StrokeOpacity);

                if (rule.Symbolizer.StrokeWidth && rule.Symbolizer.StrokeWidth > 1) {
                    strokeWidth = rule.Symbolizer.StrokeWidth;
                }

                if (rule.Symbolizer.StrokeDasharray && rule.Symbolizer.StrokeDasharray.split(' ')) {
                    strokeDasharray = rule.Symbolizer.StrokeDasharray.split(' ');
                }

                this.options.stroke = new this.ol.style.Stroke({
                    color: strokeColor,
                    width: strokeWidth,
                    lineDash: strokeDasharray
                });
            }

            // 构建option中的标签
            if (rule.Label && JSON.stringify(rule.Label) != '{}') {
                this.options.text = {};
                this.options.text.text = this.properties[rule.Label.PropertyName];
                this.options.text.font = rule.Label.FontSize;
                this.options.text.offsetX = rule.Label.AnchorPointX;
                this.options.text.offsetY = rule.Label.AnchorPointY;

                if (rule.Label.FillColor) {
                    let fillColor = this.buildRgba(rule.Label.FillColor, rule.Label.FillOpacity);
                    this.options.text.fill = new this.ol.style.Fill({
                        color: fillColor
                    });
                }

                if (rule.Label.HaloFillColor) {
                    let haloFillColor = this.buildRgba(rule.Label.HaloFillColor, rule.Label.HaloFillOpacity);
                    this.options.text.stroke = new this.ol.style.Stroke({
                        color: haloFillColor,
                        width: rule.Label.HaloRadius
                    });
                }
            }
        },

        // 根据属性和比例条件进行判断
        filter: function () {
            for (let rule of this.json.Rule) {
                // 每次循环开始前将重置filterIsPass参数
                this.filterIsPass = undefined;

                // 判断属性过滤条件，如果属性过滤条件参数不存在或者为空，则不做进一步的判断，直接赋值true
                if (rule.Filter instanceof Object == false ||
                    JSON.stringify(rule.Filter) == '{}' ||
                    rule.Filter.Conditions == undefined ||
                    rule.Filter.Conditions.length == 0) {
                    this.filterIsPass = true;
                } else {
                    this.filterConditions(rule.Filter);
                }

                this.buildOptions(rule);

                // 判断比例条件是否符合
                // let minScale = rule.MinScaleDenominator ? rule.MinScaleDenominator : 10;
                // let maxScale = rule.MaxScaleDenominator ? rule.MaxScaleDenominator : 10000000000;
                // this.scaleIsPass = (this.scale < minScale || this.scale > maxScale) ? false : true;
                // if (this.filterIsPass && this.scaleIsPass) this.buildOptions(rule);
            }
        },

        // 根据属性过滤条件进行判断
        filterConditions: function (filter) {
            for (let condition of filter.Conditions) {
                let bool, val = this.properties[condition.PropertyName] + '' || '';
                switch (condition.Condition) {
                    case 'PropertyIsEqualTo':
                        bool = (val == condition.Literal);
                        break;

                    case 'PropertyIsNotEqualTo':
                        bool = (val != condition.Literal);
                        break;

                    case 'PropertyIsLike':
                        bool = (val.indexOf(condition.Literal) > -1);
                        break;

                    case 'PropertyIsBetween':
                        let num = parseFloat(val);
                        bool = (num >= condition.LowerBoundary.Literal) && (num <= condition.UpperBoundary.Literal);
                        break;

                    default:
                        break;
                }

                if (filter.FilterType == 'And') {
                    this.filterIsPass = (this.filterIsPass == undefined) ? bool : (this.filterIsPass && bool);
                } else if (filter.FilterType == 'Or') {
                    this.filterIsPass = (this.filterIsPass == undefined) ? bool : (this.filterIsPass || bool);
                }
            }
        },

        hexToRgb: function (hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        buildRgba: function (hex, opa) {
            hex = this.hexToRgb(hex);
            if (hex == 'null') return "";
            return `rgba(${hex.r},${hex.g},${hex.b},${opa})`;
        }
    }


    //对外接口
    window.okay3d.MvtImageryProvider = MvtImageryProvider;

    window.okay3d.MvtStyle = {
        MapboxStreetsV6: MapboxStreetsV6MvtStyle,
        Sld: MvtSldStyle
    }


})(window);