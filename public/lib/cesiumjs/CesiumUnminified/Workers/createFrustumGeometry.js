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
define(['./when-60b00257', './Check-4274a1fd', './Math-223a3507', './Cartesian2-5026e7e5', './Transforms-b6bf8f4b', './RuntimeError-027c380a', './WebGLConstants-779bf0bc', './ComponentDatatype-57df98f7', './GeometryAttribute-75cd9829', './GeometryAttributes-130e4d69', './Plane-62bd9959', './VertexFormat-707c476a', './FrustumGeometry-e731198b'], function (when, Check, _Math, Cartesian2, Transforms, RuntimeError, WebGLConstants, ComponentDatatype, GeometryAttribute, GeometryAttributes, Plane, VertexFormat, FrustumGeometry) { 'use strict';

    function createFrustumGeometry(frustumGeometry, offset) {
            if (when.defined(offset)) {
                frustumGeometry = FrustumGeometry.FrustumGeometry.unpack(frustumGeometry, offset);
            }
            return FrustumGeometry.FrustumGeometry.createGeometry(frustumGeometry);
        }

    return createFrustumGeometry;

});
