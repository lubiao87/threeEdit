/*!
* Photo Sphere Viewer 4.0.0-SNAPSHOT
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2020 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('three'), require('photo-sphere-viewer'), require('photo-sphere-viewer/dist/plugins/gyroscope'), require('photo-sphere-viewer/dist/plugins/stereo'), require('photo-sphere-viewer/dist/plugins/markers'), require('photo-sphere-viewer/dist/plugins/visible-range')) :
  typeof define === 'function' && define.amd ? define(['three', 'photo-sphere-viewer', 'photo-sphere-viewer/dist/plugins/gyroscope', 'photo-sphere-viewer/dist/plugins/stereo', 'photo-sphere-viewer/dist/plugins/markers', 'photo-sphere-viewer/dist/plugins/visible-range'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.PhotoSphereViewer = global.PhotoSphereViewer || {}, global.PhotoSphereViewer.ViewerCompat = factory(global.THREE, global.PhotoSphereViewer, global.PhotoSphereViewer.GyroscopePlugin, global.PhotoSphereViewer.StereoPlugin, global.PhotoSphereViewer.MarkersPlugin, global.PhotoSphereViewer.VisibleRangePlugin)));
}(this, (function (THREE, photoSphereViewer, GyroscopePlugin, StereoPlugin, MarkersPlugin, VisibleRangePlugin) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var GyroscopePlugin__default = /*#__PURE__*/_interopDefaultLegacy(GyroscopePlugin);
  var StereoPlugin__default = /*#__PURE__*/_interopDefaultLegacy(StereoPlugin);
  var MarkersPlugin__default = /*#__PURE__*/_interopDefaultLegacy(MarkersPlugin);
  var VisibleRangePlugin__default = /*#__PURE__*/_interopDefaultLegacy(VisibleRangePlugin);

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * @private
   */

  function snakeCaseToCamelCase(options) {
    if (typeof options === 'object') {
      photoSphereViewer.utils.each(options, function (value, key) {
        if (typeof key === 'string' && key.indexOf('_') !== -1) {
          var camelKey = key.replace(/(_\w)/g, function (matches) {
            return matches[1].toUpperCase();
          });
          options[camelKey] = snakeCaseToCamelCase(value);
          delete options[key];
        }
      });
    }

    return options;
  }
  /**
   * @private
   */


  var RENAMED_OPTIONS = {
    animSpeed: 'autorotateSpeed',
    animLat: 'autorotateLat',
    usexmpdata: 'useXmpData',
    mousemoveHover: 'captureCursor',
    zoomSpeed: 'zoomButtonIncrement',
    mousewheelFactor: 'mousewheelSpeed'
  };
  /**
   * @summary Compatibility wrapper for version 3
   * @memberOf PSV
   * @deprecated
   */

  var ViewerCompat = /*#__PURE__*/function (_Viewer) {
    _inheritsLoose(ViewerCompat, _Viewer);

    /**
     * @param {PSV.Options} options
     * @fires PSV.ready
     * @throws {PSV.PSVError} when the configuration is incorrect
     */
    function ViewerCompat(options) {
      var _this;

      snakeCaseToCamelCase(options);
      photoSphereViewer.utils.each(RENAMED_OPTIONS, function (newName, oldName) {
        if (oldName in options) {
          options[newName] = options[oldName];
          delete options[oldName];
        }
      });

      if ('defaultFov' in options) {
        var minFov = options.minFov !== undefined ? options.minFov : photoSphereViewer.DEFAULTS.minFov;
        var maxFov = options.maxFov !== undefined ? options.maxFov : photoSphereViewer.DEFAULTS.maxFov;
        var defaultFov = photoSphereViewer.utils.bound(options.defaultFov, minFov, maxFov);
        options.defaultZoomLvl = (defaultFov - minFov) / (maxFov - minFov) * 100;
        delete options.defaultFov;
      }

      if (!('timeAnim' in options)) {
        options.autorotateDelay = 2000;
      } else if (options.timeAnim === false) {
        options.autorotateDelay = null;
      } else if (typeof options.timeAnim === 'number') {
        options.autorotateDelay = options.timeAnim;
      }

      delete options.timeAnim;
      delete options.transition;

      if ('panoramaRoll' in options) {
        options.sphereCorrection = options.sphereCorrection || {};
        options.sphereCorrection.roll = options.panoramaRoll;
        delete options.panoramaRoll;
      }

      if (typeof options.navbar === 'string') {
        options.navbar = options.navbar.split(' ');
      }

      if (Array.isArray(options.navbar)) {
        var markersIdx = options.navbar.indexOf('markers');

        if (markersIdx !== -1) {
          options.navbar.splice(markersIdx, 1, 'markersList');
        }
      }

      var clickEventOnMarker = options.clickEventOnMarker;
      delete options.clickEventOnMarker;
      var markers = options.markers;
      delete options.markers;
      var longitudeRange = options.longitudeRange;
      delete options.longitudeRange;
      var latitudeRange = options.latitudeRange;
      delete options.latitudeRange;
      options.plugins = [];

      if (GyroscopePlugin__default['default']) {
        options.plugins.push(GyroscopePlugin__default['default']);
      }

      if (StereoPlugin__default['default']) {
        options.plugins.push(StereoPlugin__default['default']);
      }

      if (MarkersPlugin__default['default']) {
        options.plugins.push([MarkersPlugin__default['default'], {
          clickEventOnMarker: clickEventOnMarker,
          markers: markers
        }]);
      }

      if (VisibleRangePlugin__default['default']) {
        options.plugins.push([VisibleRangePlugin__default['default'], {
          longitudeRange: longitudeRange,
          latitudeRange: latitudeRange
        }]);
      }

      _this = _Viewer.call(this, options) || this;
      _this.gyroscope = _this.getPlugin(GyroscopePlugin__default['default']);
      _this.stereo = _this.getPlugin(StereoPlugin__default['default']);
      _this.markers = _this.getPlugin(MarkersPlugin__default['default']);
      return _this;
    } // GENERAL


    var _proto = ViewerCompat.prototype;

    _proto.render = function render() {
      this.renderer.render();
    };

    _proto.setPanorama = function setPanorama(panorama, options, transition) {
      if (options === void 0) {
        options = {};
      }

      if (transition === void 0) {
        transition = false;
      }

      snakeCaseToCamelCase(options);
      options.transition = transition;
      return _Viewer.prototype.setPanorama.call(this, panorama, options);
    };

    _proto.preloadPanorama = function preloadPanorama(panorama) {
      return this.textureLoader.preloadPanorama(panorama);
    };

    _proto.clearPanoramaCache = function clearPanoramaCache(panorama) {
      if (panorama) {
        THREE.Cache.remove(panorama);
      } else {
        THREE.Cache.clear();
      }
    } // GYROSCOPE / STEREO
    ;

    _proto.isGyroscopeEnabled = function isGyroscopeEnabled() {
      return this.gyroscope && this.gyroscope.isEnabled();
    };

    _proto.startGyroscopeControl = function startGyroscopeControl() {
      return this.gyroscope && this.gyroscope.start();
    };

    _proto.stopGyroscopeControl = function stopGyroscopeControl() {
      this.gyroscope && this.gyroscope.stop();
    };

    _proto.toggleGyroscopeControl = function toggleGyroscopeControl() {
      this.gyroscope && this.gyroscope.toggle();
    };

    _proto.isStereoEnabled = function isStereoEnabled() {
      return this.stereo && this.stereo.isEnabled();
    };

    _proto.startStereoView = function startStereoView() {
      return this.stereo && this.stereo.start();
    };

    _proto.stopStereoView = function stopStereoView() {
      this.stereo && this.stereo.stop();
    };

    _proto.toggleStereoView = function toggleStereoView() {
      this.stereo && this.stereo.toggle();
    } // MARKERS
    ;

    _proto.addMarker = function addMarker(marker, render) {
      return this.markers && this.markers.addMarker(snakeCaseToCamelCase(marker), render);
    };

    _proto.getMarker = function getMarker(markerId) {
      return this.markers && this.markers.getMarker(markerId);
    };

    _proto.updateMarker = function updateMarker(marker, render) {
      return this.markers && this.markers.updateMarker(snakeCaseToCamelCase(marker), render);
    };

    _proto.removeMarker = function removeMarker(marker, render) {
      this.markers && this.markers.removeMarker(marker, render);
    };

    _proto.gotoMarker = function gotoMarker(markerOrId, duration) {
      this.markers && this.markers.gotoMarker(markerOrId, duration);
    };

    _proto.hideMarker = function hideMarker(markerId) {
      this.markers && this.markers.hideMarker(markerId);
    };

    _proto.showMarker = function showMarker(markerId) {
      this.markers && this.markers.showMarker(markerId);
    };

    _proto.clearMarkers = function clearMarkers(render) {
      this.markers && this.markers.clearMarkers(render);
    };

    _proto.getCurrentMarker = function getCurrentMarker() {
      return this.markers && this.markers.getCurrentMarker();
    } // NAVBAR
    ;

    _proto.showNavbar = function showNavbar() {
      this.navbar.show();
    };

    _proto.hideNavbar = function hideNavbar() {
      this.navbar.hide();
    };

    _proto.toggleNavbar = function toggleNavbar() {
      this.navbar.toggle();
    };

    _proto.getNavbarButton = function getNavbarButton(id, silent) {
      return this.navbar.getButton(id, silent);
    };

    _proto.setCaption = function setCaption(html) {
      return this.navbar.setCaption(html);
    } // NOTIFICATION
    ;

    _proto.showNotification = function showNotification(config) {
      this.notification.show(config);
    };

    _proto.hideNotification = function hideNotification() {
      this.notification.hide();
    };

    _proto.isNotificationVisible = function isNotificationVisible() {
      return this.notification.isVisible();
    } // OVERLAY
    ;

    _proto.showOverlay = function showOverlay(config) {
      this.overlay.show(config);
    };

    _proto.hideOverlay = function hideOverlay() {
      this.overlay.hide();
    };

    _proto.isOverlayVisible = function isOverlayVisible() {
      return this.overlay.isVisible();
    } // PANEL
    ;

    _proto.showPanel = function showPanel(config) {
      this.panel.show(config);
    };

    _proto.hidePanel = function hidePanel() {
      this.panel.hide();
    } // TOOLTIP
    ;

    _proto.showTooltip = function showTooltip(config) {
      this.prop.mainTooltip = this.tooltip.create(config);
    };

    _proto.hideTooltip = function hideTooltip() {
      if (this.prop.mainTooltip) {
        this.prop.mainTooltip.hide();
        this.prop.mainTooltip = null;
      }
    };

    _proto.isTooltipVisible = function isTooltipVisible() {
      return !!this.prop.mainTooltip;
    };

    return ViewerCompat;
  }(photoSphereViewer.Viewer);

  return ViewerCompat;

})));
//# sourceMappingURL=viewer-compat.js.map
