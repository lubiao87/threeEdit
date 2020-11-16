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
define(["./when-60b00257","./Check-4274a1fd","./Math-9d37f659","./Cartesian2-2951f601","./Transforms-dfaa2438","./RuntimeError-027c380a","./WebGLConstants-779bf0bc","./ComponentDatatype-a29c6075","./GeometryAttribute-982114f8","./GeometryAttributes-130e4d69","./AttributeCompression-a0720a96","./GeometryPipeline-23cbc63d","./EncodedCartesian3-c262bebc","./IndexDatatype-527cbd94","./IntersectionTests-427d2ec7","./Plane-28d196a2","./GeometryInstance-b8810dd4","./arrayRemoveDuplicates-ac049603","./EllipsoidTangentPlane-23a3c48e","./OrientedBoundingBox-eb033a24","./CoplanarPolygonGeometryLibrary-58fc4672","./ArcType-a321d0d9","./EllipsoidRhumbLine-cbcd6a13","./PolygonPipeline-62080774","./PolygonGeometryLibrary-9d2f7fbf"],function(a,e,t,c,p,r,n,s,u,d,o,m,i,f,y,l,g,b,h,P,G,v,L,C,T){"use strict";function E(e){for(var t=e.length,r=new Float64Array(3*t),n=f.IndexDatatype.createTypedArray(t,2*t),o=0,a=0,i=0;i<t;i++){var y=e[i];r[o++]=y.x,r[o++]=y.y,r[o++]=y.z,n[a++]=i,n[a++]=(i+1)%t}var l=new d.GeometryAttributes({position:new u.GeometryAttribute({componentDatatype:s.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:r})});return new u.Geometry({attributes:l,indices:n,primitiveType:u.PrimitiveType.LINES})}function k(e){var t=(e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT)).polygonHierarchy;this._polygonHierarchy=t,this._workerName="createCoplanarPolygonOutlineGeometry",this.packedLength=T.PolygonGeometryLibrary.computeHierarchyPackedLength(t)+1}k.fromPositions=function(e){return new k({polygonHierarchy:{positions:(e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT)).positions}})},k.pack=function(e,t,r){return r=a.defaultValue(r,0),t[r=T.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,r)]=e.packedLength,t};var H={polygonHierarchy:{}};return k.unpack=function(e,t,r){t=a.defaultValue(t,0);var n=T.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t);t=n.startingIndex,delete n.startingIndex;var o=e[t];return a.defined(r)||(r=new k(H)),r._polygonHierarchy=n,r.packedLength=o,r},k.createGeometry=function(e){var t=e._polygonHierarchy,r=t.positions;if(!((r=b.arrayRemoveDuplicates(r,c.Cartesian3.equalsEpsilon,!0)).length<3)&&G.CoplanarPolygonGeometryLibrary.validOutline(r)){var n=T.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(t,!1);if(0!==n.length){for(var o=[],a=0;a<n.length;a++){var i=new g.GeometryInstance({geometry:E(n[a])});o.push(i)}var y=m.GeometryPipeline.combineInstances(o)[0],l=p.BoundingSphere.fromPoints(t.positions);return new u.Geometry({attributes:y.attributes,indices:y.indices,primitiveType:y.primitiveType,boundingSphere:l})}}},function(e,t){return a.defined(t)&&(e=k.unpack(e,t)),e._ellipsoid=c.Ellipsoid.clone(e._ellipsoid),k.createGeometry(e)}});
