export function ChangeSlowly(options, calback) {
  let option = {
    site: options.site || 0, // 站点
    end: options.end || 1, // 目标点
    step: options.step || 0.1, // 步长
    animation: false,
  };
  option.start = options.start || option.site;
  clearInterval(time);
  let time = setInterval(() => {
    option.option = true;
    if (option.site < option.end) {
      option.site += option.step;
    } else if (option.site < option.end) {
      option.site -= option.step;
    } else {
      clearInterval(time);
      if (options.sucess) {
        options.sucess(option);
      }
      option.option = false;
    }
    if (calback && option.option) calback(option);
  }, 100);
}

