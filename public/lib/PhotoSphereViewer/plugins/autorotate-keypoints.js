/*!
* Photo Sphere Viewer 4.0.0-SNAPSHOT
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2020 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('photo-sphere-viewer')) :
  typeof define === 'function' && define.amd ? define(['photo-sphere-viewer'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.PhotoSphereViewer = global.PhotoSphereViewer || {}, global.PhotoSphereViewer.AutorotateKeypointsPlugin = factory(global.PhotoSphereViewer)));
}(this, (function (photoSphereViewer) { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

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
   * @typedef {PSV.ExtendedPosition|string|Object} PSV.plugins.AutorotateKeypointsPlugin.Keypoints
   * @summary Definition of keypoints for automatic rotation, can be a position object, a marker id or an object with the following properties
   * @property {string} [markerId]
   * @property {PSV.ExtendedPosition} [position]
   * @property {string|{content: string, position: string}} [tooltip]
   * @property {number} [pause=0]
   */

  /**
   * @typedef {Object} PSV.plugins.AutorotateKeypointsPlugin.Options
   * @property {boolean} [startFromClosest=true] - start from the closest keypoint instead of the first keypoint
   * @property {PSV.plugins.AutorotateKeypointsPlugin.Keypoints[]} keypoints
   */

  /**
   * @summary Number of steps between each points
   * @type {number}
   * @constant
   * @private
   */

  var NUM_STEPS = 16;

  var serializePt = function serializePt(position) {
    return [position.longitude, position.latitude];
  };
  /**
   * @summary Replaces the standard autorotate animation by a smooth transition between multiple points
   * @extends PSV.plugins.AbstractPlugin
   * @memberof PSV.plugins
   */


  var AutorotateKeypointsPlugin = /*#__PURE__*/function (_AbstractPlugin) {
    _inheritsLoose(AutorotateKeypointsPlugin, _AbstractPlugin);

    /**
     * @param {PSV.Viewer} psv
     * @param {PSV.plugins.AutorotateKeypointsPlugin.Options} [options]
     */
    function AutorotateKeypointsPlugin(psv, options) {
      var _this;

      _this = _AbstractPlugin.call(this, psv) || this;
      /**
       * @member {Object}
       * @property {number} idx -  current index in keypoints
       * @property {number[][]} curve - curve between idx and idx + 1
       * @property {number[]} startPt - start point of the current step
       * @property {number[]} endPt - end point of the current step
       * @property {number} startTime - start time of the current step
       * @property {number} stepDuration - expected duration of the step
       * @property {number} remainingPause - time remaining for the pause
       * @property {number} lastTime - previous timestamp in render loop
       * @property {PSV.components.Tooltip} tooltip - currently displayed tooltip
       * @private
       */

      _this.state = {};
      /**
       * @member {PSV.plugins.AutorotateKeypointsPlugin.Options}
       * @private
       */

      _this.config = _extends({
        startFromClosest: true
      }, options, {
        keypoints: null
      });
      /**
       * @type {PSV.plugins.MarkersPlugin}
       * @private
       */

      _this.markers = _this.psv.getPlugin('markers');

      if (options == null ? void 0 : options.keypoints) {
        _this.setKeypoints(options.keypoints);
      }

      _this.psv.on(photoSphereViewer.CONSTANTS.EVENTS.AUTOROTATE, _assertThisInitialized(_this));

      return _this;
    }

    var _proto = AutorotateKeypointsPlugin.prototype;

    _proto.destroy = function destroy() {
      this.psv.off(photoSphereViewer.CONSTANTS.EVENTS.AUTOROTATE, this);
      delete this.keypoints;
      delete this.state;

      _AbstractPlugin.prototype.destroy.call(this);
    };

    _proto.handleEvent = function handleEvent(e) {
      if (e.type === photoSphereViewer.CONSTANTS.EVENTS.AUTOROTATE) {
        this.__configure();
      }
    }
    /**
     * @summary Changes the keypoints
     * @param {PSV.plugins.AutorotateKeypointsPlugin.Keypoints[]} keypoints
     */
    ;

    _proto.setKeypoints = function setKeypoints(keypoints) {
      var _this2 = this;

      if ((keypoints == null ? void 0 : keypoints.length) < 2) {
        throw new photoSphereViewer.PSVError('At least two points are required');
      }

      this.keypoints = photoSphereViewer.utils.clone(keypoints);

      if (this.keypoints) {
        this.keypoints.forEach(function (pt, i) {
          if (typeof pt === 'string') {
            // eslint-disable-next-line no-param-reassign
            pt = {
              markerId: pt
            };
          } else if (_this2.psv.dataHelper.isExtendedPosition(pt)) {
            // eslint-disable-next-line no-param-reassign
            pt = {
              position: pt
            };
          }

          if (pt.markerId) {
            if (!_this2.markers) {
              throw new photoSphereViewer.PSVError("Keypoint #" + i + " references a marker but markers plugin is not loaded");
            }

            var marker = _this2.markers.getMarker(pt.markerId);

            pt.position = serializePt(marker.props.position);
          } else if (pt.position) {
            pt.position = serializePt(_this2.psv.dataHelper.cleanPosition(pt.position));
          } else {
            throw new photoSphereViewer.PSVError("Keypoint #" + i + " is missing marker or position");
          }

          if (typeof pt.tooltip === 'string') {
            pt.tooltip = {
              content: pt.tooltip
            };
          }

          _this2.keypoints[i] = pt;
        });
      }

      this.__configure();
    }
    /**
     * @private
     */
    ;

    _proto.__configure = function __configure() {
      var _this3 = this;

      if (!this.psv.isAutorotateEnabled() || !this.keypoints) {
        this.__hideTooltip();

        this.state = {};
        return;
      }

      this.state = {
        idx: -1,
        curve: [],
        startPt: null,
        endPt: null,
        startTime: null,
        stepDuration: null,
        remainingPause: null,
        lastTime: null,
        tooltip: null
      };

      if (this.config.startFromClosest) {
        var _this$keypoints;

        var index = this.__findMinIndex(this.keypoints, function (keypoint) {
          return photoSphereViewer.utils.greatArcDistance(keypoint.position, serializePt(_this3.psv.prop.position));
        });

        (_this$keypoints = this.keypoints).push.apply(_this$keypoints, this.keypoints.splice(0, index));
      }

      var autorotateCb = function autorotateCb(e, timestamp) {
        // initialisation
        if (!_this3.state.startTime) {
          _this3.state.endPt = serializePt(_this3.psv.prop.position);

          _this3.__nextStep();

          _this3.state.startTime = timestamp;
          _this3.state.lastTime = timestamp;
        }

        _this3.__nextFrame(timestamp);
      };

      this.psv.off(photoSphereViewer.CONSTANTS.EVENTS.BEFORE_RENDER, this.psv.prop.autorotateCb);
      this.psv.prop.autorotateCb = autorotateCb;
      this.psv.on(photoSphereViewer.CONSTANTS.EVENTS.BEFORE_RENDER, this.psv.prop.autorotateCb);
    }
    /**
     * @private
     */
    ;

    _proto.__incrementIdx = function __incrementIdx() {
      this.state.idx++;

      if (this.state.idx === this.keypoints.length) {
        this.state.idx = 0;
      }
    }
    /**
     * @private
     */
    ;

    _proto.__showTooltip = function __showTooltip() {
      var keypoint = this.keypoints[this.state.idx];

      if (keypoint.tooltip) {
        var position = this.psv.dataHelper.vector3ToViewerCoords(this.psv.prop.direction);
        this.state.tooltip = this.psv.tooltip.create({
          content: keypoint.tooltip.content,
          position: keypoint.tooltip.position,
          top: position.y,
          left: position.x
        });
      } else if (keypoint.markerId) {
        var marker = this.markers.getMarker(keypoint.markerId);
        marker.showTooltip();
        this.state.tooltip = marker.tooltip;
      }
    }
    /**
     * @private
     */
    ;

    _proto.__hideTooltip = function __hideTooltip() {
      if (this.state.tooltip) {
        var keypoint = this.keypoints[this.state.idx];

        if (keypoint.tooltip) {
          this.state.tooltip.hide();
        } else if (keypoint.markerId) {
          var marker = this.markers.getMarker(keypoint.markerId);
          marker.hideTooltip();
        }

        this.state.tooltip = null;
      }
    }
    /**
     * @private
     */
    ;

    _proto.__nextPoint = function __nextPoint() {
      // get the 4 points necessary to compute the current movement
      // one point before and two points before current
      var workPoints = [];

      if (this.state.idx === -1) {
        workPoints.push(serializePt(this.psv.prop.position), serializePt(this.psv.prop.position), this.keypoints[0].position, this.keypoints[1].position);
      } else {
        for (var i = -1; i < 3; i++) {
          var keypoint = this.state.idx + i < 0 ? this.keypoints[this.keypoints.length - 1] : this.keypoints[(this.state.idx + i) % this.keypoints.length];
          workPoints.push(keypoint.position);
        }
      } // apply offsets to avoid crossing the origin


      var workPoints2 = [workPoints[0].slice(0)];
      var k = 0;

      for (var _i = 1; _i <= 3; _i++) {
        var d = workPoints[_i - 1][0] - workPoints[_i][0];

        if (d > Math.PI) {
          // crossed the origin left to right
          k += 1;
        } else if (d < -Math.PI) {
          // crossed the origin right to left
          k -= 1;
        }

        if (k !== 0 && _i === 1) {
          // do not modify first point, apply the reverse offset the the previous point instead
          workPoints2[0][0] -= k * 2 * Math.PI;
          k = 0;
        }

        workPoints2.push([workPoints[_i][0] + k * 2 * Math.PI, workPoints[_i][1]]);
      } // only keep the curve for the current movement


      this.state.curve = this.__getCurvePoints(workPoints2, 0.6, NUM_STEPS).slice(NUM_STEPS, NUM_STEPS * 2);

      if (this.state.idx !== -1) {
        this.state.remainingPause = this.keypoints[this.state.idx].pause;

        if (this.state.remainingPause) {
          this.__showTooltip();
        } else {
          this.__incrementIdx();
        }
      } else {
        this.__incrementIdx();
      }
    }
    /**
     * @private
     */
    ;

    _proto.__nextStep = function __nextStep() {
      if (this.state.curve.length === 0) {
        this.__nextPoint(); // reset transformation made to the previous point


        this.state.endPt[0] = photoSphereViewer.utils.parseAngle(this.state.endPt[0]);
      } // target next point


      this.state.startPt = this.state.endPt;
      this.state.endPt = this.state.curve.shift(); // compute duration from distance and speed

      var distance = photoSphereViewer.utils.greatArcDistance(this.state.startPt, this.state.endPt);
      this.state.stepDuration = distance * 1000 / Math.abs(this.psv.config.autorotateSpeed);

      if (distance === 0) {
        // edge case
        this.__nextStep();
      }
    }
    /**
     * @private
     */
    ;

    _proto.__nextFrame = function __nextFrame(timestamp) {
      var ellapsed = timestamp - this.state.lastTime;
      this.state.lastTime = timestamp; // currently paused

      if (this.state.remainingPause) {
        this.state.remainingPause = Math.max(0, this.state.remainingPause - ellapsed);

        if (this.state.remainingPause > 0) {
          return;
        } else {
          this.__hideTooltip();

          this.__incrementIdx();

          this.state.startTime = timestamp;
        }
      }

      var progress = (timestamp - this.state.startTime) / this.state.stepDuration;

      if (progress >= 1) {
        this.__nextStep();

        progress = 0;
        this.state.startTime = timestamp;
      }

      this.psv.rotate({
        longitude: this.state.startPt[0] + (this.state.endPt[0] - this.state.startPt[0]) * progress,
        latitude: this.state.startPt[1] + (this.state.endPt[1] - this.state.startPt[1]) * progress
      }, true);
    }
    /**
     * @summary Interpolate curvature points using cardinal spline
     * {@link https://stackoverflow.com/a/15528789/1207670}
     * @param {number[][]} pts
     * @param {number} [tension=0.5]
     * @param {number} [numOfSegments=16]
     * @returns {number[][]}
     * @private
     */
    ;

    _proto.__getCurvePoints = function __getCurvePoints(pts, tension, numOfSegments) {
      if (tension === void 0) {
        tension = 0.5;
      }

      if (numOfSegments === void 0) {
        numOfSegments = 16;
      }

      var res = []; // The algorithm require a previous and next point to the actual point array.

      var _pts = pts.slice(0);

      _pts.unshift(pts[0]);

      _pts.push(pts[pts.length - 1]); // 1. loop through each point
      // 2. loop through each segment


      for (var i = 1; i < _pts.length - 2; i++) {
        // calc tension vectors
        var t1x = (_pts[i + 1][0] - _pts[i - 1][0]) * tension;
        var t2x = (_pts[i + 2][0] - _pts[i][0]) * tension;
        var t1y = (_pts[i + 1][1] - _pts[i - 1][1]) * tension;
        var t2y = (_pts[i + 2][1] - _pts[i][1]) * tension;

        for (var t = 1; t <= numOfSegments; t++) {
          // calc step
          var st = t / numOfSegments;
          var st3 = Math.pow(st, 3);
          var st2 = Math.pow(st, 2); // calc cardinals

          var c1 = 2 * st3 - 3 * st2 + 1;
          var c2 = -2 * st3 + 3 * st2;
          var c3 = st3 - 2 * st2 + st;
          var c4 = st3 - st2; // calc x and y cords with common control vectors

          var x = c1 * _pts[i][0] + c2 * _pts[i + 1][0] + c3 * t1x + c4 * t2x;
          var y = c1 * _pts[i][1] + c2 * _pts[i + 1][1] + c3 * t1y + c4 * t2y; // store points in array

          res.push([x, y]);
        }
      }

      return res;
    };

    _proto.__findMinIndex = function __findMinIndex(array, mapper) {
      var idx = 0;
      var current = Number.MAX_VALUE;
      array.forEach(function (item, i) {
        var value = mapper ? mapper(item) : item;

        if (value < current) {
          current = value;
          idx = i;
        }
      });
      return idx;
    };

    return AutorotateKeypointsPlugin;
  }(photoSphereViewer.AbstractPlugin);

  AutorotateKeypointsPlugin.id = 'autorotate-keypoints';

  return AutorotateKeypointsPlugin;

})));
//# sourceMappingURL=autorotate-keypoints.js.map
