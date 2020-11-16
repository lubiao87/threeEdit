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
define(["./when-60b00257","./Check-4274a1fd","./Math-9d37f659","./Cartesian2-2951f601","./Transforms-dfaa2438","./RuntimeError-027c380a","./WebGLConstants-779bf0bc","./ComponentDatatype-a29c6075","./GeometryAttribute-982114f8","./GeometryAttributes-130e4d69"],function(r,e,t,a,i,n,o,u,c,s){"use strict";function y(){this._workerName="createPlaneOutlineGeometry"}y.packedLength=0,y.pack=function(e,t){return t},y.unpack=function(e,t,n){return r.defined(n)?n:new y};var m=new a.Cartesian3(-.5,-.5,0),p=new a.Cartesian3(.5,.5,0);return y.createGeometry=function(){var e=new s.GeometryAttributes,t=new Uint16Array(8),n=new Float64Array(12);return n[0]=m.x,n[1]=m.y,n[2]=m.z,n[3]=p.x,n[4]=m.y,n[5]=m.z,n[6]=p.x,n[7]=p.y,n[8]=m.z,n[9]=m.x,n[10]=p.y,n[11]=m.z,e.position=new c.GeometryAttribute({componentDatatype:u.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n}),t[0]=0,t[1]=1,t[2]=1,t[3]=2,t[4]=2,t[5]=3,t[6]=3,t[7]=0,new c.Geometry({attributes:e,indices:t,primitiveType:c.PrimitiveType.LINES,boundingSphere:new i.BoundingSphere(a.Cartesian3.ZERO,Math.sqrt(2))})},function(e,t){return r.defined(t)&&(e=y.unpack(e,t)),y.createGeometry(e)}});
