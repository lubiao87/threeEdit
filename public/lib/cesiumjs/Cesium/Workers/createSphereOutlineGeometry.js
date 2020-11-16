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
define(["./when-60b00257","./Check-4274a1fd","./Math-9d37f659","./Cartesian2-2951f601","./Transforms-dfaa2438","./RuntimeError-027c380a","./WebGLConstants-779bf0bc","./ComponentDatatype-a29c6075","./GeometryAttribute-982114f8","./GeometryAttributes-130e4d69","./IndexDatatype-527cbd94","./GeometryOffsetAttribute-8756c94a","./EllipsoidOutlineGeometry-9436dd3e"],function(n,e,i,s,t,r,o,a,d,l,u,c,m){"use strict";function p(e){var i=n.defaultValue(e.radius,1),t={radii:new s.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new m.EllipsoidOutlineGeometry(t),this._workerName="createSphereOutlineGeometry"}p.packedLength=m.EllipsoidOutlineGeometry.packedLength,p.pack=function(e,i,t){return m.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var y=new m.EllipsoidOutlineGeometry,G={radius:void 0,radii:new s.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return p.unpack=function(e,i,t){var r=m.EllipsoidOutlineGeometry.unpack(e,i,y);return G.stackPartitions=r._stackPartitions,G.slicePartitions=r._slicePartitions,G.subdivisions=r._subdivisions,n.defined(t)?(s.Cartesian3.clone(r._radii,G.radii),t._ellipsoidGeometry=new m.EllipsoidOutlineGeometry(G),t):(G.radius=r._radii.x,new p(G))},p.createGeometry=function(e){return m.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return n.defined(i)&&(e=p.unpack(e,i)),p.createGeometry(e)}});
