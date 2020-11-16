/*!
* Photo Sphere Viewer 4.0.0-SNAPSHOT
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2020 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('photo-sphere-viewer'), require('photo-sphere-viewer/dist/plugins/settings')) :
  typeof define === 'function' && define.amd ? define(['photo-sphere-viewer', 'photo-sphere-viewer/dist/plugins/settings'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.PhotoSphereViewer = global.PhotoSphereViewer || {}, global.PhotoSphereViewer.ResolutionPlugin = factory(global.PhotoSphereViewer, global.PhotoSphereViewer.SettingsPlugin)));
}(this, (function (photoSphereViewer, SettingsPlugin) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var SettingsPlugin__default = /*#__PURE__*/_interopDefaultLegacy(SettingsPlugin);

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  /**
   * @summary Returns deep equality between objects
   * {@link https://gist.github.com/egardner/efd34f270cc33db67c0246e837689cb9}
   * @param obj1
   * @param obj2
   * @return {boolean}
   * @private
   */
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    } else if (isObject(obj1) && isObject(obj2)) {
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
      }

      for (var _i = 0, _Object$keys = Object.keys(obj1); _i < _Object$keys.length; _i++) {
        var prop = _Object$keys[_i];

        if (!deepEqual(obj1[prop], obj2[prop])) {
          return false;
        }
      }

      return true;
    } else {
      return false;
    }
  }

  function isObject(obj) {
    return typeof obj === 'object' && obj != null;
  }

  photoSphereViewer.DEFAULTS.lang.resolution = 'Quality';
  /**
   * @typedef {Object} PSV.plugins.ResolutionPlugin.Resolution
   * @property {string} id
   * @property {string} label
   * @property {string|string[]|PSV.Cubemap} panorama
   */

  /**
   * @typedef {Object} PSV.plugins.ResolutionPlugin.Options
   * @property {PSV.plugins.ResolutionPlugin.Resolution[]} resolutions - list of available resolutions
   */

  /**
   * @summary Adds a setting to choose between multiple resolutions of the panorama.
   * @extends PSV.plugins.AbstractPlugin
   * @memberof PSV.plugins
   */

  var ResolutionPlugin = /*#__PURE__*/function (_AbstractPlugin) {
    _inheritsLoose(ResolutionPlugin, _AbstractPlugin);

    /**
     * @summary Available events
     * @enum {string}
     * @memberof PSV.plugins.ResolutionPlugin
     * @constant
     */

    /**
     * @param {PSV.Viewer} psv
     * @param {PSV.plugins.ResolutionPlugin.Options} options
     */
    function ResolutionPlugin(psv, options) {
      var _this;

      _this = _AbstractPlugin.call(this, psv) || this;
      /**
       * @type {PSV.plugins.SettingsPlugin}
       * @readonly
       * @private
       */

      _this.settings = SettingsPlugin__default['default'] ? psv.getPlugin(SettingsPlugin__default['default']) : null;

      if (!_this.settings) {
        throw new photoSphereViewer.PSVError('Resolution plugin requires the Settings plugin');
      }

      _this.settings.addSetting({
        id: ResolutionPlugin.id,
        type: 'options',
        label: _this.psv.config.lang.resolution,
        current: function current() {
          return _this.prop.resolution ? _this.resolutionsById[_this.prop.resolution].label : '';
        },
        options: function options() {
          return _this.__getSettingsOptions();
        },
        apply: function apply(resolution) {
          return _this.setResolution(resolution);
        }
      });
      /**
       * @summary Available resolutions
       * @member {PSV.plugins.ResolutionPlugin.Resolution[]}
       */


      _this.resolutions = [];
      /**
       * @summary Available resolutions
       * @member {Object.<string, PSV.plugins.ResolutionPlugin.Resolution>}
       * @private
       */

      _this.resolutionsById = {};
      /**
       * @type {Object}
       * @property {string} resolution - Current resolution
       * @private
       */

      _this.prop = {
        resolution: null
      };

      _this.psv.on(photoSphereViewer.CONSTANTS.EVENTS.PANORAMA_LOADED, _assertThisInitialized(_this));

      if (options == null ? void 0 : options.resolutions) {
        _this.setResolutions(options.resolutions);
      }

      return _this;
    }
    /**
     * @package
     */


    var _proto = ResolutionPlugin.prototype;

    _proto.destroy = function destroy() {
      this.psv.off(photoSphereViewer.CONSTANTS.EVENTS.PANORAMA_LOADED, this);
      this.settings.removeSetting(SettingsPlugin__default['default'].id);

      _AbstractPlugin.prototype.destroy.call(this);
    }
    /**
     * @summary Handles events
     * @param {Event} e
     * @private
     */
    ;

    _proto.handleEvent = function handleEvent(e) {
      if (e.type === photoSphereViewer.CONSTANTS.EVENTS.PANORAMA_LOADED) {
        this.__refreshResolution();
      }
    }
    /**
     * @summary Changes the available resolutions
     * @param {PSV.plugins.ResolutionPlugin.Resolution[]} resolutions
     */
    ;

    _proto.setResolutions = function setResolutions(resolutions) {
      var _this2 = this;

      this.resolutions = resolutions;
      this.resolutionsById = {};
      resolutions.forEach(function (resolution) {
        if (!resolution.id) {
          throw new photoSphereViewer.PSVError('Missing resolution id');
        }

        _this2.resolutionsById[resolution.id] = resolution;
      });

      this.__refreshResolution();
    }
    /**
     * @summary Changes the current resolution
     * @param {string} id
     */
    ;

    _proto.setResolution = function setResolution(id) {
      if (!this.resolutionsById[id]) {
        throw new photoSphereViewer.PSVError("Resolution " + id + " unknown");
      }

      return this.psv.setPanorama(this.resolutionsById[id].panorama, {
        transition: false,
        showLoader: false
      });
    }
    /**
     * @summary Returns the current resolution
     * @return {string}
     */
    ;

    _proto.getResolution = function getResolution() {
      return this.prop.resolution;
    }
    /**
     * @summary Updates current resolution on panorama load
     * @private
     */
    ;

    _proto.__refreshResolution = function __refreshResolution() {
      var _this3 = this;

      var resolution = this.resolutions.find(function (r) {
        return deepEqual(_this3.psv.config.panorama, r.panorama);
      });

      if (this.prop.resolution !== (resolution == null ? void 0 : resolution.id)) {
        this.prop.resolution = resolution == null ? void 0 : resolution.id;
        this.trigger(ResolutionPlugin.EVENTS.RESOLUTION_CHANGED, this.prop.resolution);
      }
    }
    /**
     * @summary Returns options for Settings plugin
     * @return {PSV.plugins.SettingsPlugin.Option[]}
     * @private
     */
    ;

    _proto.__getSettingsOptions = function __getSettingsOptions() {
      var _this4 = this;

      return this.resolutions.map(function (resolution) {
        return {
          type: 'button',
          id: resolution.id,
          active: resolution.id === _this4.prop.resolution,
          label: resolution.label
        };
      });
    };

    return ResolutionPlugin;
  }(photoSphereViewer.AbstractPlugin);

  ResolutionPlugin.id = 'resolution';
  ResolutionPlugin.EVENTS = {
    /**
     * @event resolution-changed
     * @memberof PSV.plugins.ResolutionPlugin
     * @summary Triggered when the resolution is changed
     * @param {string} resolutionId
     */
    RESOLUTION_CHANGED: 'resolution-changed'
  };

  return ResolutionPlugin;

})));
//# sourceMappingURL=resolution.js.map
