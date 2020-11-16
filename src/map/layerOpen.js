export function layerOpen(option) {
  layer.closeAll();
  let id = Number(
    Math.random()
      .toString()
      .substr(3, length) + Date.now()
  ).toString(36);
  let options = {
    skin: option.skin || "myclass",
    type: option.type || 1, //Page层类型
    area: option.area || ["300px", "500px"],
    title: option.title || "layer",
    maxmin: true, //允许全屏最小化
    btn: option.btn || [], //可以无限个按钮
    anim: option.anim || 3, //0-6的动画形式，-1不开启
    content: option.content || "",
    id: option.layerId || id,
    shade: option.shade || 0, // 不显示遮罩
    offset: "r",
  };
  if (option.btn && option.btn.length > 0) {
    for (let index = 0; index < option.btn.length; index++) {
      const element = option.btn[index];
      let ins = null;
      if (index === 0) {
        ins = "yes";
      } else {
        ins = "btn" + (index + 1);
      }
      options[ins] = function(index, layero) {
        //按钮的回调
        if (option.btnCalback) {
          option.btnCalback(index, layero);
        }
      };
    }
  }
  options.cancel = function() {
    //右上角关闭回调
    if (option.btnCancel) {
      option.btnCancel();
    }

    //return false 开启该代码可禁止点击该按钮关闭
  };
  options.end = function() {
    //销毁回调
    if (option.end) {
      option.end();
    }
  };
  layer.open(options);
  return layer;
}
