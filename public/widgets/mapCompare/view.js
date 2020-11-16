//当前页面业务
var thisWidget;
var layersObj = {};

function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    //初始化树
    var setting = {
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onCheck: treeOverlays_onCheck,
            onDblClick: treeOverlays_onDblClick
        },
        view: {
            // addDiyDom: addOpacityRangeDom
        }
    };
    var zNodes = [];
    var layers = thisWidget.getLayers();
    for (var i = layers.length - 1; i >= 0; i--) {
        var item = layers[i];

        var node = {
            id: item.id,
            pId: item.pid,
            name: item.name,
            _type: item.type,
            _key: item._key,
        };
        if (item.hasLayer) {
            node.icon = "../manageLayers/images/layer2.png";
            node.checked = false;
            if (item._parent)
                node._parent = item._parent._key;
            //记录图层
            layersObj[node._key] = item;
            zNodes.push(node);
        } else {
            node.icon = "../manageLayers/images/folder.png";
            node.open = item.open == null ? true : item.open;
            zNodes.push(node);
        }
    }
    $.fn.zTree.init($("#treeOverlays_left"), setting, zNodes);

}


//viewEx图层渲染
function treeOverlays_onCheck(e, treeId, treeNode) { 
    var zTree = $.fn.zTree.getZTreeObj(treeId);
    //获得所有改变check状态的节点
    var changedNodes = zTree.getChangeCheckedNodes();
    for (var i = 0; i < changedNodes.length; i++) {
        var treeNode = changedNodes[i];
        treeNode.checkedOld = treeNode.checked;
        var layer = layersObj[treeNode._key];
        if (layer == null) continue;
        
        //显示隐藏透明度设置view
        // if (treeNode.checked)
        //     $("#" + treeNode.tId + "_range").show();
        // else
        //     $("#" + treeNode.tId + "_range").hide();

        //单选的互斥的节点，特殊处理下。 
        if (treeNode._type == "terrain" && treeNode.checked) {
            function filter(node) {
                return node._type == "terrain" && node._key != treeNode._key;
            }
            var nodes = zTree.getNodesByFilter(filter, false, treeNode.getParentNode());
            for (var nidx = 0; nidx < nodes.length; nidx++) {

                nodes[nidx].checkedOld = false;
                zTree.checkNode(nodes[nidx], false, true);

                var layertmp = layersObj[nodes[nidx]._key];
                compareView.updateLayerVisible(layertmp, false);
            }
        }
        //处理图层显示隐藏
        if (treeNode._parent) {
            var parentLayer = layersObj[treeNode._parent];
            thisWidget.updateLayerVisible(layer, treeNode.checked, parentLayer);
        } else {
            thisWidget.updateLayerVisible(layer, treeNode.checked);
        }
    }
}


function treeOverlays_onDblClick(event, treeId, treeNode) {
    var item = layersObj[treeNode._key];
    thisWidget.centerAt(item);
}


