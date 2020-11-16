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
define(["./when-60b00257","./Check-4274a1fd","./Math-9d37f659","./Cartesian2-2951f601","./Transforms-dfaa2438","./RuntimeError-027c380a","./WebGLConstants-779bf0bc","./ComponentDatatype-a29c6075","./GeometryAttribute-982114f8","./GeometryAttributes-130e4d69","./AttributeCompression-a0720a96","./GeometryPipeline-23cbc63d","./EncodedCartesian3-c262bebc","./IndexDatatype-527cbd94","./IntersectionTests-427d2ec7","./Plane-28d196a2","./PrimitivePipeline-234c9a12","./WebMercatorProjection-a1ea4f18","./createTaskProcessorWorker"],function(u,e,r,t,n,a,i,o,s,c,f,d,b,m,l,p,y,P,k){"use strict";var v={};function C(e){var r=v[e];return u.defined(r)||("object"==typeof exports?v[r]=r=require("Workers/"+e):require(["Workers/"+e],function(e){v[r=e]=e})),r}return k(function(e,r){for(var t=e.subTasks,n=t.length,a=new Array(n),i=0;i<n;i++){var o=t[i],s=o.geometry,c=o.moduleName;if(u.defined(c)){var f=C(c);a[i]=f(s,o.offset)}else a[i]=s}return u.when.all(a,function(e){return y.PrimitivePipeline.packCreateGeometryResults(e,r)})})});
