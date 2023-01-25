# 简介
基于d3的力导向图，通过读取.xlsx文件生成可视化关系图


# 使用文档

- ### 完整示例
```js
// <div id="mapId"></div>
import {ForceGraph} from 'd3-utils'
let graph = new ForceGraph('mapId', [
    { id: 1, name: 1 },
    { id: 2, name: 2 },
    { id: 3, name: 3 },
    { id: 4, name: 4 },
    { id: 5, name: 5 },
    { id: 6, name: 6 },
    { id: 7, name: 7 },
], [
    { source: 1, target: 2, label: '指向' },
    { source: 1, target: 3, label: '指向' },
    { source: 1, target: 4, label: '指向' },
    { source: 1, target: 5, label: '指向' },
    { source: 1, target: 6, label: '' },
    { source: 1, target: 7, label: '' },
], {
    width: 400,
    height: 400,
})
```

- ### 创建一个力导向图

    通过从 *d3-utils* 引入 *ForceGraph* 类，然后实例化一个ForceGraph对象

    const graph = new ForceGraph(mapId, nodes, links, options, events)

    构造函数接受参数解释如下

    - mapId: graph外部容器节点id
    - nodes：节点数据，{ id, name, someAttributes }
    - links: 连线数据，{ source: 节点Id, target: 被指向节点Id  }
    - events: {clickNodeEvent: 点击节点的回调方法, clickLinkEvent: 点击连线的回调方法}

    - #### options属性
        - width: 容器宽度，例如: width: 520
        - height: 容器高度: width: 520
        - label: 连线标签属性
            - fontSize： 标签字体大小，默认值 4
            - fontColor： 字体颜色，默认值 #333
            - padding： 标签左右填充大小，默认值 4
            - height： 标签高度，默认值 8
            - borderRadius： 圆角，默认值 2,
            - borderWidth：边框宽度，默认值 1,
            - borderColor： 边框颜色，默认值#666'
            - background：背景颜色，默认值 #fff
            - arrowWidth： 箭头大小，默认值 5
            - arrowColor： 箭头填充颜色，默认值#666
            - arrowStrokeColor：箭头边框颜色，默认值#666


- ### 方法
    - #### graph.append(nodes, links)：添加节点与连线
    - #### graph.delete(id)：根据id删除节点与相关的连线
