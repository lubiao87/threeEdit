/* 2017-12-5 14:28:44 | 修改 木遥（微信:  http://marsgis.cn/weixin.html ） */
//此方式：弹窗非iframe模式
okay3d.widget.bindClass(
  okay3d.widget.BaseWidget.extend({
    options: {
      resources: ['view.css'],
      view: [{ type: 'append', url: 'view.html', parent: '#centerDiv' }],
    },
    //此数据也可以放在widget.json的配置中，但是发现很多人容易引起同名误解，所以还是放在这里
    data: [
      {
        name: '底图',
        icon: 'fa fa-map',
        widget: 'widgets/manageBasemaps/widget.js',
      },
      // {
      //   name: '图层',
      //   icon: 'fa fa-tasks',
      //   widget: 'widgets/manageLayers/widget.js',
      // },
      {
        name: '工具',
        icon: 'fa fa-cubes',
        children: [],
      },
    ],
    //初始化[仅执行1次]
    create: function() {},
    //每个窗口创建完成后调用
    winCreateOK: function(viewopt, html) {
      let arr = window.location.href.split('=')
      var uuid = arr[1]
      console.log('uuid', uuid)
      var configfile = '/api/earth/earthtools/?uuid=' + uuid
      $.ajax({
        type: 'get',
        dataType: 'json',
        url: configfile,
        timeout: 0,
        success: function(json) {
          console.log('json', json)
          let obj = json.earth_tools.tools
          this.data[1].children = obj
          if (viewopt.type != 'append') return

          var widgetObj = {}
          var inhtml = ''
          var arr = this.config.data || this.data
          for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i]
            if (item.hasOwnProperty('visible') && !item.visible) continue
            if (item.children) {
              //分组

              inhtml +=
                '<div class="btn-group">\
                                    <button type="button" class="btn btn-link toolBarRight-btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false">\
                                        <i class="' +
                item.icon +
                '"></i>' +
                item.name +
                ' <span class="caret"></span>\
                                    </button>\
                                    <ul class="dropdown-menu dropdown-menu-right toolBarRight-dropdown-menu" >'
              for (var j = 0, jlen = item.children.length; j < jlen; j++) {
                var children_item = item.children[j]
                if (
                  children_item.hasOwnProperty('visible') &&
                  !children_item.visible
                )
                  continue

                var ex = ''
                if (children_item.onclick)
                  ex = 'onclick="' + children_item.onclick + '"'
                else if (children_item.widget)
                  ex = 'data-widget="' + children_item.widget + '"'

                inhtml +=
                  '<li class="widget-btn" ' +
                  ex +
                  '><a href="javascript:void(0)"><i class="' +
                  children_item.icon +
                  '"></i>' +
                  children_item.name +
                  '</a></li>'
                widgetObj[children_item.widget] = children_item
              }
              inhtml += ' </ul></div>'
            } else {
              //不是分组
              var ex = ''
              if (item.onclick) ex = 'onclick="' + item.onclick + '"'
              else if (item.widget) ex = 'data-widget="' + item.widget + '"'

              inhtml +=
                '<button type="button" class="widget-btn btn btn-link toolBarRight-btn " ' +
                ex +
                '>\
                                <i class="' +
                item.icon +
                '"></i>' +
                item.name +
                '\
                            </button>'
              widgetObj[item.widget] = item
            }
          }
          $('.toolBarRight').html(inhtml)

          $('.toolBarRight .widget-btn').click(function() {
            // if($(this)[0].innerText == '图层') {

            //   return;
            // }
            console.log('单击了工具栏：' + $(this).text())
            var uri = $(this).attr('data-widget')
            if (haoutil.isutil.isNull(uri)) return
            if (okay3d.widget.isActivate(uri)) {
              okay3d.widget.disable(uri)
            } else {
              var opt = widgetObj[uri] || {}
              opt.uri = uri

              okay3d.widget.activate(opt)
            }
          })
        }.bind(this),
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert(configfile + '文件加载失败！')
        },
      })
    },
    //激活插件
    activate: function() {},
    //释放插件
    disable: function() {},
  })
)
