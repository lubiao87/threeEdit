/**
 * Cesium - https://github.com/CesiumGS/cesium
 *
 * Copyright 2011-2020 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 
 *  该版本修改了部分代码，主要是汉化、优化功能、添加接口 等 by Mars3D 广州欧科 http://marsgis.cn
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/master/LICENSE.md for full licensing details.
 */
define(["exports","./Check-4274a1fd","./Cartesian2-2951f601","./Transforms-dfaa2438","./OrientedBoundingBox-eb033a24"],function(n,t,l,x,B){"use strict";var e={},s=new l.Cartesian3,P=new l.Cartesian3,M=new l.Cartesian3,h=new l.Cartesian3,v=new B.OrientedBoundingBox;function o(n,t,e,a,r){var i=l.Cartesian3.subtract(n,t,s),o=l.Cartesian3.dot(e,i),u=l.Cartesian3.dot(a,i);return l.Cartesian2.fromElements(o,u,r)}e.validOutline=function(n){var t=B.OrientedBoundingBox.fromPoints(n,v).halfAxes,e=x.Matrix3.getColumn(t,0,P),a=x.Matrix3.getColumn(t,1,M),r=x.Matrix3.getColumn(t,2,h),i=l.Cartesian3.magnitude(e),o=l.Cartesian3.magnitude(a),u=l.Cartesian3.magnitude(r);return!(0===i&&(0===o||0===u)||0===o&&0===u)},e.computeProjectTo2DArguments=function(n,t,e,a){var r,i,o=B.OrientedBoundingBox.fromPoints(n,v),u=o.halfAxes,s=x.Matrix3.getColumn(u,0,P),C=x.Matrix3.getColumn(u,1,M),m=x.Matrix3.getColumn(u,2,h),c=l.Cartesian3.magnitude(s),d=l.Cartesian3.magnitude(C),g=l.Cartesian3.magnitude(m),f=Math.min(c,d,g);return(0!==c||0!==d&&0!==g)&&(0!==d||0!==g)&&(f!==d&&f!==g||(r=s),f===c?r=C:f===g&&(i=C),f!==c&&f!==d||(i=m),l.Cartesian3.normalize(r,e),l.Cartesian3.normalize(i,a),l.Cartesian3.clone(o.center,t),!0)},e.createProjectPointsTo2DFunction=function(a,r,i){return function(n){for(var t=new Array(n.length),e=0;e<n.length;e++)t[e]=o(n[e],a,r,i);return t}},e.createProjectPointTo2DFunction=function(e,a,r){return function(n,t){return o(n,e,a,r,t)}},n.CoplanarPolygonGeometryLibrary=e});
