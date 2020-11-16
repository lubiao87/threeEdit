// 图层
import axios from 'axios'
axios.defaults.withCredentials = true;
// axios.defaults.timeout =  10000;

import { Message } from "element-ui";

axios.interceptors.request.use(config=> {
  return config;
}, err=> {
  Message.error({message: '请求超时!'});
  return Promise.resolve(err);
})
axios.interceptors.response.use(data=> {
  if (data.status && data.status == 200 && data.data.status == 'error') {
    Message.error({message: data.data.msg});
    return;
  }
  return data;
}, err=> {
  if (err.response.status == 504||err.response.status == 404) {
    Message.error({message: '服务器被吃了⊙﹏⊙∥'});
  } else if (err.response.status == 500) {
    Message.error({message: '网络连接失败!'});
  } else if (err.response.status == 403) {
    Message.error({message: '权限不足,请联系管理员!'});
  }else {
    if(err.response.data) {
      Message.error({message: err.response.data.error});
    } else {
      Message.error({message: '未知错误!'});
    }

  }
  return Promise.resolve(err);
})


export function putUserdata(data, id) {
  const url = `/api/earth/earthconfig/?uuid=${id}`;
  return axios.post(url, data).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function project_setting(id) {
  // const url = 'config/config.json';
  const url = `/api/earth/earth_setting/?uuid=${id}`;
  return axios
    .get(url)
    .then((res) => {
      // console.log('project_setting--', res)
      return Promise.resolve(res.data)
    })
}
export function project_setting_put(id, data) {
  // const url = `/api/project_setting/${id}/`;
  const url = `/api/earth/earth_setting/?uuid=${id}`;
  return axios.put(url, data).then((res) => {
    return Promise.resolve(res.data)
  })
}
export function getMapConfigLocal(){
  const url = `./config/config.json`;
	// const url = `/cesium/manager/api/menus/${param}/`;
	// const data = '';
	return axios.get(url, {
    // params: data,
    dataType: "json",
	}).then(res => {
    // console.log("data--", res.data)
		return Promise.resolve(res.data);
	});
}
export function getLocalHostConfig(){
	const url = 'config/config2.json'
	return axios.get(url).then(res => {
		return Promise.resolve(res.data)
	})
}
export function getMapConfig(id){
  // const url = 'config/config2.json'
	const url = '/api/earth/earthconfig/?uuid=' + id
	return axios.get(url).then(res => {
		return Promise.resolve(res.data)
	})
}
export function getWidgetConfig(){
	const url = 'config/widget.json'
	const data = ''
	return axios.get(url, {
		params: data
	}).then(res => {
		return Promise.resolve(res.data)
	})
}
export function postEarth(data){
	const url = '/api/earth/'
	return axios.post(url, data).then(res => {
		return Promise.resolve(res.data)
	})
}
export function show_userbalance(){
	const url = '/api/user/login_user/'
	return axios.get(url).then(res => {
		return Promise.resolve(res.data)
	})
}
export function getModelListData(data){ // 模型列表
	const url = `/api/project/?name=${data.name}&size=${data.size}&page=${data.page}`
	return axios.get(url).then(res => {
		return Promise.resolve(res.data)
	})
}
export function getModelMapconfig(id){ // 模型列表
	const url = `/api/project/mapconfig/?uuid=${id}`
	return axios.get(url).then(res => {
		return Promise.resolve(res.data)
	})
}