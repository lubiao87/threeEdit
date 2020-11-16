/*!
* Photo Sphere Viewer 4.0.0-SNAPSHOT
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2020 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('photo-sphere-viewer')) :
  typeof define === 'function' && define.amd ? define(['photo-sphere-viewer'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.PhotoSphereViewer = global.PhotoSphereViewer || {}, global.PhotoSphereViewer.SettingsPlugin = factory(global.PhotoSphereViewer)));
}(this, (function (photoSphereViewer) { 'use strict';

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

  var check = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 90 90\"><polygon fill=\"currentColor\"  points=\"0,48 10,35 36,57 78,10 90,21 37,79 \"/><!-- Created by Zahroe from the Noun Project --></svg>\n";

  var chevron = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path fill=\"currentColor\" d=\"M86.2 50.7l-44 44-9.9-9.9 34.1-34.1-34.7-34.8L41.6 6z\"/><!-- Created by Renee Ramsey-Passmore from the Noun Project--></svg>\n";

  var icon = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path fill=\"currentColor\" d=\"M98.4 43.7c-.8-.5-7-4.3-9.6-5.4l-3-7.5c.9-2.5 2.6-9.4 3-10.6a3.3 3.3 0 00-1-3.1L83 12.2a3.3 3.3 0 00-3-.9c-1 .2-8 2-10.7 3l-7.5-3.1c-1-2.4-4.8-8.6-5.4-9.6A3.3 3.3 0 0053.4 0h-6.8a3.4 3.4 0 00-2.9 1.6c-.5.8-4.2 7-5.4 9.6l-7.5 3-10.6-3a3.3 3.3 0 00-3.1 1L12.2 17a3.3 3.3 0 00-.9 3c.2 1 2 8 3 10.7l-3.1 7.5c-2.4 1-8.6 4.8-9.6 5.4A3.3 3.3 0 000 46.6v6.8a3.4 3.4 0 001.6 2.9c.8.5 7 4.2 9.6 5.4l3 7.5-3 10.6a3.3 3.3 0 001 3.1l4.8 4.9a3.3 3.3 0 003.1.9c1-.2 8-2 10.7-3l7.5 3c1 2.5 4.7 8.6 5.4 9.7a3.3 3.3 0 002.9 1.6h6.8a3.4 3.4 0 002.9-1.6c.5-.8 4.2-7 5.4-9.6l7.5-3c2.5.9 9.4 2.6 10.6 3a3.3 3.3 0 003.1-1l4.9-4.8a3.3 3.3 0 00.9-3.1c-.2-1-2-8-3-10.7l3-7.5c2.5-1 8.6-4.7 9.7-5.4a3.3 3.3 0 001.6-2.9v-6.8a3.3 3.3 0 00-1.6-2.9zM50 71.7A21.8 21.8 0 1171.8 50 21.8 21.8 0 0150 71.8z\"/><!-- Created by i cons from the Noun Project --></svg>\n";

  /**
   * @summary Navigation bar settings button class
   * @extends PSV.buttons.AbstractButton
   * @memberof PSV.buttons
   */

  var SettingsButton = /*#__PURE__*/function (_AbstractButton) {
    _inheritsLoose(SettingsButton, _AbstractButton);

    /**
     * @param {PSV.components.Navbar} navbar
     */
    function SettingsButton(navbar) {
      var _this;

      _this = _AbstractButton.call(this, navbar, 'psv-button--hover-scale psv-settings-button', true) || this;
      /**
       * @type {PSV.plugins.SettingsPlugin}
       * @private
       * @readonly
       */

      _this.plugin = _this.psv.getPlugin(SettingsPlugin.id);

      if (_this.plugin) {
        _this.psv.on(photoSphereViewer.CONSTANTS.EVENTS.OPEN_PANEL, _assertThisInitialized(_this));

        _this.psv.on(photoSphereViewer.CONSTANTS.EVENTS.CLOSE_PANEL, _assertThisInitialized(_this));
      }

      return _this;
    }
    /**
     * @override
     */


    var _proto = SettingsButton.prototype;

    _proto.destroy = function destroy() {
      this.psv.off(photoSphereViewer.CONSTANTS.EVENTS.OPEN_PANEL, this);
      this.psv.off(photoSphereViewer.CONSTANTS.EVENTS.CLOSE_PANEL, this);
      delete this.plugin;

      _AbstractButton.prototype.destroy.call(this);
    }
    /**
     * @override
     */
    ;

    _proto.isSupported = function isSupported() {
      return !!this.plugin;
    }
    /**
     * @summary Handles events
     * @param {Event} e
     * @private
     */
    ;

    _proto.handleEvent = function handleEvent(e) {
      /* eslint-disable */
      switch (e.type) {
        // @formatter:off
        case photoSphereViewer.CONSTANTS.EVENTS.OPEN_PANEL:
          this.toggleActive(e.args[0] === SettingsPlugin.ID_PANEL);
          break;

        case photoSphereViewer.CONSTANTS.EVENTS.CLOSE_PANEL:
          this.toggleActive(false);
          break;
        // @formatter:on
      }
      /* eslint-enable */

    }
    /**
     * @override
     * @description Toggles settings
     */
    ;

    _proto.onClick = function onClick() {
      this.plugin.toggleSettings();
    };

    return SettingsButton;
  }(photoSphereViewer.AbstractButton);
  SettingsButton.id = 'settings';
  SettingsButton.icon = icon;

  var switchOff = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 100\" width=\"2.4em\" height=\"1.2em\"><path fill=\"currentColor\" transform=\"scale(1.88) translate(0, -25)\" d=\"M72 73.2H44A26.4 26.4 0 0044 30h28a21.6 21.6 0 010 43.2M7.2 51.6a21.6 21.6 0 1143.2 0 21.6 21.6 0 01-43.2 0M72 25.2H28.8a26.4 26.4 0 000 52.8H72a26.4 26.4 0 000-52.8\"/><!-- Created by Nikita from the Noun Project --></svg>\n";

  var switchOn = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 100\" width=\"2.4em\" height=\"1.2em\"><path fill=\"currentColor\" transform=\"scale(1.88) translate(0, -25)\" d=\"M72 73.2A21.6 21.6 0 1172 30a21.6 21.6 0 010 43.2M2.4 51.6A26.4 26.4 0 0028.8 78H72a26.4 26.4 0 000-52.8H28.8A26.4 26.4 0 002.4 51.6\"/><!-- Created by Nikita from the Noun Project --></svg>\n";

  photoSphereViewer.DEFAULTS.navbar.splice(photoSphereViewer.DEFAULTS.navbar.indexOf('fullscreen'), 0, SettingsButton.id);
  photoSphereViewer.DEFAULTS.lang[SettingsButton.id] = 'Settings';
  photoSphereViewer.registerButton(SettingsButton);
  /**
   * @typedef {Object} PSV.plugins.SettingsPlugin.Setting
   * @summary Description of a setting
   * @property {string} id - identifier of the setting
   * @property {string} label - label of the setting
   * @property {'options' | 'toggle'} type - type of the setting
   */

  /**
   * @typedef {PSV.plugins.SettingsPlugin.Setting} PSV.plugins.SettingsPlugin.OptionsSetting
   * @summary Description of a 'options' setting
   * @property {'options'} type - type of the setting
   * @property {function} current - function which returns the current value (human readable)
   * @property {function} options - function which the possible options as an array of {@link PSV.plugins.SettingsPlugin.Option}
   * @property {function} apply - function called with the id of the selected option
   */

  /**
   * @typedef {PSV.plugins.SettingsPlugin.Setting} PSV.plugins.SettingsPlugin.ToggleSetting
   * @summary Description of a 'toggle' setting
   * @property {'toggle'} type - type of the setting
   * @property {function} active - function which return whereas the setting is active or not
   * @property {function} toggle - function called when the setting is toggled
   */

  /**
   * @typedef {Object} PSV.plugins.SettingsPlugin.Option
   * @summary Option of an 'option' setting
   * @property {string} id - identifier of the option
   * @property {string} label - label of the option
   * @property {boolean} active - state of the option
   */

  /**
   * @summary Adds a button to access various settings.
   * @extends PSV.plugins.AbstractPlugin
   * @memberof PSV.plugins
   */

  var SettingsPlugin = /*#__PURE__*/function (_AbstractPlugin) {
    _inheritsLoose(SettingsPlugin, _AbstractPlugin);

    /**
     * @summary Panel identifier for settings content
     * @type {string}
     * @constant
     */

    /**
     * @summary Property name added to settings items
     * @type {string}
     * @constant
     */

    /**
     * @summary Settings list template
     * @param {PSV.plugins.SettingsPlugin.Setting[]} settings
     * @param {string} title
     * @param {string} dataKey
     * @returns {string}
     */

    /**
     * @summary Setting item template, by type
     */

    /**
     * @summary Settings options template
     * @param {PSV.plugins.SettingsPlugin.OptionsSetting} setting
     * @param {string} title
     * @param {string} dataKey
     * @returns {string}
     */

    /**
     * @param {PSV.Viewer} psv
     */
    function SettingsPlugin(psv) {
      var _this;

      _this = _AbstractPlugin.call(this, psv) || this;
      /**
       * @type {PSV.plugins.SettingsPlugin.Setting[]}
       * @private
       */

      _this.settings = [];
      return _this;
    }
    /**
     * @package
     */


    var _proto = SettingsPlugin.prototype;

    _proto.destroy = function destroy() {
      _AbstractPlugin.prototype.destroy.call(this);
    }
    /**
     * @summary Registers a new setting
     * @param {PSV.plugins.SettingsPlugin.Setting} setting
     */
    ;

    _proto.addSetting = function addSetting(setting) {
      if (!setting.id) {
        throw new photoSphereViewer.PSVError('Missing setting id');
      }

      if (!setting.type) {
        throw new photoSphereViewer.PSVError('Missing setting type');
      }

      if (!SettingsPlugin.SETTINGS_TEMPLATE_[setting.type]) {
        throw new photoSphereViewer.PSVError('Unsupported setting type');
      }

      this.settings.push(setting);

      if (this.psv.panel.prop.contentId === SettingsPlugin.ID_PANEL) {
        this.showSettings();
      }
    }
    /**
     * @summary Removes a setting
     * @param {string} id
     */
    ;

    _proto.removeSetting = function removeSetting(id) {
      var idx = -1; // FIXME use findIndex, one day, when IE11 is totally dead

      this.settings.some(function (setting, i) {
        if (setting.id === id) {
          idx = i;
          return true;
        }

        return false;
      });

      if (idx !== -1) {
        this.settings.splice(idx, 1);

        if (this.psv.panel.prop.contentId === SettingsPlugin.ID_PANEL) {
          this.showSettings();
        }
      }
    }
    /**
     * @summary Toggles the settings panel
     */
    ;

    _proto.toggleSettings = function toggleSettings() {
      if (this.psv.panel.prop.contentId === SettingsPlugin.ID_PANEL) {
        this.hideSettings();
      } else {
        this.showSettings();
      }
    }
    /**
     * @summary Hides the settings panel
     */
    ;

    _proto.hideSettings = function hideSettings() {
      this.psv.panel.hide(SettingsPlugin.ID_PANEL);
    }
    /**
     * @summary Shows the settings panel
     */
    ;

    _proto.showSettings = function showSettings() {
      var _this2 = this;

      this.psv.panel.show({
        id: SettingsPlugin.ID_PANEL,
        content: SettingsPlugin.SETTINGS_TEMPLATE(this.settings, this.psv.config.lang[SettingsButton.id], photoSphereViewer.utils.dasherize(SettingsPlugin.SETTING_DATA)),
        noMargin: true,
        clickHandler: function clickHandler(e) {
          var li = e.target ? photoSphereViewer.utils.getClosest(e.target, 'li') : undefined;
          var settingId = li ? li.dataset[SettingsPlugin.SETTING_DATA] : undefined;

          var setting = _this2.settings.find(function (s) {
            return s.id === settingId;
          });

          if (setting) {
            switch (setting.type) {
              case 'toggle':
                setting.toggle();

                _this2.showSettings();

                break;

              case 'options':
                _this2.__showOptions(setting);

                break;

            }
          }
        }
      });
    }
    /**
     * @summary Shows setting options panel
     * @param {PSV.plugins.SettingsPlugin.OptionsSetting} setting
     * @private
     */
    ;

    _proto.__showOptions = function __showOptions(setting) {
      var _this3 = this;

      this.psv.panel.show({
        id: SettingsPlugin.ID_PANEL,
        content: SettingsPlugin.SETTING_OPTIONS_TEMPLATE(setting, this.psv.config.lang[SettingsButton.id], photoSphereViewer.utils.dasherize(SettingsPlugin.SETTING_DATA)),
        noMargin: true,
        clickHandler: function clickHandler(e) {
          var li = e.target ? photoSphereViewer.utils.getClosest(e.target, 'li') : undefined;
          var optionId = li ? li.dataset[SettingsPlugin.SETTING_DATA] : undefined;

          if (optionId === '__back') {
            _this3.showSettings();
          } else {
            setting.apply(optionId);

            _this3.hideSettings();
          }
        }
      });
    };

    return SettingsPlugin;
  }(photoSphereViewer.AbstractPlugin);

  SettingsPlugin.id = 'settings';
  SettingsPlugin.ID_PANEL = 'settings';
  SettingsPlugin.SETTING_DATA = 'settingId';

  SettingsPlugin.SETTINGS_TEMPLATE = function (settings, title, dataKey) {
    return "\n<h1 class=\"psv-settings-title\">" + icon + " " + title + "</h1>\n<ul class=\"psv-settings-list\">\n  " + settings.map(function (s) {
      return "\n    <li class=\"psv-settings-item\" data-" + dataKey + "=\"" + s.id + "\">\n      " + SettingsPlugin.SETTINGS_TEMPLATE_[s.type](s) + "\n    </li>\n  ";
    }).join('') + "\n</ul>";
  };

  SettingsPlugin.SETTINGS_TEMPLATE_ = {
    options: function options(setting) {
      return "\n      <span class=\"psv-settings-item-label\">" + setting.label + "</span> \n      <span class=\"psv-settings-item-value\">" + setting.current() + "</span> \n      <span class=\"psv-settings-item-icon\">" + chevron + "</span>\n    ";
    },
    toggle: function toggle(setting) {
      return "\n      <span class=\"psv-settings-item-label\">" + setting.label + "</span>\n      <span class=\"psv-settings-item-value\">" + (setting.active() ? switchOn : switchOff) + "</span>\n    ";
    }
  };

  SettingsPlugin.SETTING_OPTIONS_TEMPLATE = function (setting, title, dataKey) {
    return "\n<h1 class=\"psv-settings-title\">" + icon + " " + title + "</h1>\n<ul class=\"psv-settings-list\">\n  <li class=\"psv-settings-item psv-settings-item--header\" data-" + dataKey + "=\"__back\">\n    <span class=\"psv-settings-item-icon\">" + chevron + "</span>\n    <span class=\"psv-settings-item-label\">" + setting.label + "</span>\n  </li>\n  " + setting.options().map(function (s) {
      return "\n    <li class=\"psv-settings-item\" data-" + dataKey + "=\"" + s.id + "\">\n      <span class=\"psv-settings-item-icon\">" + (s.active ? check : '') + "</span>\n      <span class=\"psv-settings-item-value\">" + s.label + "</span>\n    </li>\n  ";
    }).join('') + "\n</ul>";
  };

  return SettingsPlugin;

})));
//# sourceMappingURL=settings.js.map
