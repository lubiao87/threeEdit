/*
 * 用于组件复用
 * 参考链接 https://cn.vuejs.org/v2/guide/mixins.html#全局混合
 * 混合 (mixins) 是一种分发 Vue 组件中可复用功能的非常灵活的方式。混合对象可以包含任意组件选项。以组件使用混合对象时，所有混合对象的选项将被混入该组件本身的选项。
 */

import { listSearch } from './searchMixin.js'
export const listSearchMixin = { ...listSearch }
