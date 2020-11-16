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
define(["./when-60b00257","./Check-4274a1fd","./Math-9d37f659","./Cartesian2-2951f601","./Transforms-dfaa2438","./RuntimeError-027c380a","./WebGLConstants-779bf0bc","./ComponentDatatype-a29c6075","./GeometryAttribute-982114f8","./GeometryAttributes-130e4d69","./IndexDatatype-527cbd94","./IntersectionTests-427d2ec7","./Plane-28d196a2","./EllipsoidTangentPlane-23a3c48e","./EllipsoidRhumbLine-cbcd6a13","./PolygonPipeline-62080774","./EllipsoidGeodesic-0d3740b4","./PolylinePipeline-0519ed07","./WallGeometryLibrary-b82af848"],function(P,e,G,L,x,i,t,T,V,D,I,a,n,r,o,s,l,d,S){"use strict";var R=new L.Cartesian3,M=new L.Cartesian3;function m(e){var i=(e=P.defaultValue(e,P.defaultValue.EMPTY_OBJECT)).positions,t=e.maximumHeights,a=e.minimumHeights,n=P.defaultValue(e.granularity,G.CesiumMath.RADIANS_PER_DEGREE),r=P.defaultValue(e.ellipsoid,L.Ellipsoid.WGS84);this._positions=i,this._minimumHeights=a,this._maximumHeights=t,this._granularity=n,this._ellipsoid=L.Ellipsoid.clone(r),this._workerName="createWallOutlineGeometry";var o=1+i.length*L.Cartesian3.packedLength+2;P.defined(a)&&(o+=a.length),P.defined(t)&&(o+=t.length),this.packedLength=o+L.Ellipsoid.packedLength+1}m.pack=function(e,i,t){var a;t=P.defaultValue(t,0);var n=e._positions,r=n.length;for(i[t++]=r,a=0;a<r;++a,t+=L.Cartesian3.packedLength)L.Cartesian3.pack(n[a],i,t);var o=e._minimumHeights;if(r=P.defined(o)?o.length:0,i[t++]=r,P.defined(o))for(a=0;a<r;++a)i[t++]=o[a];var s=e._maximumHeights;if(r=P.defined(s)?s.length:0,i[t++]=r,P.defined(s))for(a=0;a<r;++a)i[t++]=s[a];return L.Ellipsoid.pack(e._ellipsoid,i,t),i[t+=L.Ellipsoid.packedLength]=e._granularity,i};var u=L.Ellipsoid.clone(L.Ellipsoid.UNIT_SPHERE),p={positions:void 0,minimumHeights:void 0,maximumHeights:void 0,ellipsoid:u,granularity:void 0};return m.unpack=function(e,i,t){var a;i=P.defaultValue(i,0);var n,r,o=e[i++],s=new Array(o);for(a=0;a<o;++a,i+=L.Cartesian3.packedLength)s[a]=L.Cartesian3.unpack(e,i);if(0<(o=e[i++]))for(n=new Array(o),a=0;a<o;++a)n[a]=e[i++];if(0<(o=e[i++]))for(r=new Array(o),a=0;a<o;++a)r[a]=e[i++];var l=L.Ellipsoid.unpack(e,i,u),d=e[i+=L.Ellipsoid.packedLength];return P.defined(t)?(t._positions=s,t._minimumHeights=n,t._maximumHeights=r,t._ellipsoid=L.Ellipsoid.clone(l,t._ellipsoid),t._granularity=d,t):(p.positions=s,p.minimumHeights=n,p.maximumHeights=r,p.granularity=d,new m(p))},m.fromConstantHeights=function(e){var i,t,a=(e=P.defaultValue(e,P.defaultValue.EMPTY_OBJECT)).positions,n=e.minimumHeight,r=e.maximumHeight,o=P.defined(n),s=P.defined(r);if(o||s){var l=a.length;i=o?new Array(l):void 0,t=s?new Array(l):void 0;for(var d=0;d<l;++d)o&&(i[d]=n),s&&(t[d]=r)}return new m({positions:a,maximumHeights:t,minimumHeights:i,ellipsoid:e.ellipsoid})},m.createGeometry=function(e){var i=e._positions,t=e._minimumHeights,a=e._maximumHeights,n=e._granularity,r=e._ellipsoid,o=S.WallGeometryLibrary.computePositions(r,i,a,t,n,!1);if(P.defined(o)){var s,l=o.bottomPositions,d=o.topPositions,m=d.length,u=2*m,p=new Float64Array(u),f=0;for(m/=3,s=0;s<m;++s){var h=3*s,c=L.Cartesian3.fromArray(d,h,R),g=L.Cartesian3.fromArray(l,h,M);p[f++]=g.x,p[f++]=g.y,p[f++]=g.z,p[f++]=c.x,p[f++]=c.y,p[f++]=c.z}var y=new D.GeometryAttributes({position:new V.GeometryAttribute({componentDatatype:T.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:p})}),v=u/3;u=2*v-4+v;var E=I.IndexDatatype.createTypedArray(v,u),_=0;for(s=0;s<v-2;s+=2){var C=s,H=s+2,b=L.Cartesian3.fromArray(p,3*C,R),A=L.Cartesian3.fromArray(p,3*H,M);if(!L.Cartesian3.equalsEpsilon(b,A,G.CesiumMath.EPSILON10)){var k=s+1,w=s+3;E[_++]=k,E[_++]=C,E[_++]=k,E[_++]=w,E[_++]=C,E[_++]=H}}return E[_++]=v-2,E[_++]=v-1,new V.Geometry({attributes:y,indices:E,primitiveType:V.PrimitiveType.LINES,boundingSphere:new x.BoundingSphere.fromVertices(p)})}},function(e,i){return P.defined(i)&&(e=m.unpack(e,i)),e._ellipsoid=L.Ellipsoid.clone(e._ellipsoid),m.createGeometry(e)}});
