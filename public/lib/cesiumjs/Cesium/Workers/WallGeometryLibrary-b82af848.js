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
define(["exports","./when-60b00257","./Math-9d37f659","./Cartesian2-2951f601","./EllipsoidTangentPlane-23a3c48e","./PolygonPipeline-62080774","./PolylinePipeline-0519ed07"],function(e,C,A,w,E,O,b){"use strict";var i={};var M=new w.Cartographic,L=new w.Cartographic;var F=new Array(2),H=new Array(2),T={positions:void 0,height:void 0,granularity:void 0,ellipsoid:void 0};i.computePositions=function(e,i,t,n,r,o){var a=function(e,i,t,n){var r=i.length;if(!(r<2)){var o=C.defined(n),a=C.defined(t),l=!0,h=new Array(r),s=new Array(r),g=new Array(r),p=i[0];h[0]=p;var d=e.cartesianToCartographic(p,M);a&&(d.height=t[0]),l=l&&d.height<=0,s[0]=d.height,g[0]=o?n[0]:0;for(var P,u,c=1,v=1;v<r;++v){var y=i[v],f=e.cartesianToCartographic(y,L);a&&(f.height=t[v]),l=l&&f.height<=0,P=d,u=f,A.CesiumMath.equalsEpsilon(P.latitude,u.latitude,A.CesiumMath.EPSILON14)&&A.CesiumMath.equalsEpsilon(P.longitude,u.longitude,A.CesiumMath.EPSILON14)?d.height<f.height&&(s[c-1]=f.height):(h[c]=y,s[c]=f.height,g[c]=o?n[v]:0,w.Cartographic.clone(f,d),++c)}if(!(l||c<2))return h.length=c,s.length=c,g.length=c,{positions:h,topHeights:s,bottomHeights:g}}}(e,i,t,n);if(C.defined(a)){if(i=a.positions,t=a.topHeights,n=a.bottomHeights,3<=i.length){var l=E.EllipsoidTangentPlane.fromPoints(i,e).projectPointsOntoPlane(i);O.PolygonPipeline.computeWindingOrder2D(l)===O.WindingOrder.CLOCKWISE&&(i.reverse(),t.reverse(),n.reverse())}var h,s,g=i.length,p=g-2,d=A.CesiumMath.chordLength(r,e.maximumRadius),P=T;if(P.minDistance=d,P.ellipsoid=e,o){var u,c=0;for(u=0;u<g-1;u++)c+=b.PolylinePipeline.numberOfPoints(i[u],i[u+1],d)+1;h=new Float64Array(3*c),s=new Float64Array(3*c);var v=F,y=H;P.positions=v,P.height=y;var f=0;for(u=0;u<g-1;u++){v[0]=i[u],v[1]=i[u+1],y[0]=t[u],y[1]=t[u+1];var m=b.PolylinePipeline.generateArc(P);h.set(m,f),y[0]=n[u],y[1]=n[u+1],s.set(b.PolylinePipeline.generateArc(P),f),f+=m.length}}else P.positions=i,P.height=t,h=new Float64Array(b.PolylinePipeline.generateArc(P)),P.height=n,s=new Float64Array(b.PolylinePipeline.generateArc(P));return{bottomPositions:s,topPositions:h,numCorners:p}}},e.WallGeometryLibrary=i});
