// const d3 = window.d3;
export class ForceGraph {
  mapId = "";
  nodes = [];
  links = [];
  options = {
    width: 100,
    height: 100,
    label: {
      fontSize: 4,
      padding: 4,
      height: 8,
      borderRadius: 2,
      borderWidth: 1,
      background: '#fff',
      borderColor: '#666',
      fontColor: '#333',
      arrowWidth: 5,
      arrowColor: '#666',
      arrowStrokeColor: '#666'
    }
  };

  // 越小越聚团
  linkDistance = 180;

  // DOM结构：SVG -> G -> nodesG、linksG、linkLabelG ....
  svgContainer = null;
  // 主空间
  graphContainer = null;
  nodesContainer = null;
  linksContainer = null;
  linksLabelContainer = null;

  simulation = null;

  clickNodeEvent = (event, data) => {}
  clickLinkEvent = (event, data) => {}

  constructor(mapId = "", nodes = [], links = [], options = {}, events = {clickNodeEvent: '', clickLinkEvent: ''}) {
    this.mapId = mapId;
    this.nodes = nodes;
    this.links = links;
    
    this.clickNodeEvent = events?.clickNodeEvent
    this.clickLinkEvent = events?.clickLinkEvent

    this.options = {
      ...this.options,
      ...options,
    };

    // 创建zoom
    this.createSvgContainer();

    this.createTools()

    this.createSimulation();
    this.createLinksLabelContainer();
    this.createLinksContainer();
    this.createNodesContainer();

    this.ticked();
  }

  createSvgContainer() {
    const { width, height } = this.options;
    this.svgContainer = window.d3
      .select(`#${this.mapId}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    this.graphContainer = this.svgContainer
      .call(
        d3.zoom().on("zoom", ({ transform }) => {
          this.graphContainer.attr("transform", transform);
        })
      )
      .append("g");
  }

  createSimulation() {
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force("charge", d3.forceManyBody())
      .force(
        "link",
        d3
          .forceLink(this.links)
          .id((d) => d.id)
          .distance(this.linkDistance)
      )
    // .force("x", d3.forceX())
    // .force("y", d3.forceY());
  }

  createNodesContainer() {
    this.nodesContainer = this.graphContainer
      .append("g")
      .attr("class", "nodesContainer")
      .attr("fill", "#fff666")
      .attr("stroke", "#666")
      .attr("stroke-width", 10)
      .selectAll("circle");

    this.bindNodesData();
  }

  createLinksLabelContainer() {
    this.linksLabelContainer = this.graphContainer
      .append("g")
      .attr("class", "linksLabelContainer")

    this.createLabelDefs()
  }

  createLinksContainer() {
    this.linksContainer = this.graphContainer
      .append("g")
      .attr("class", "linksContainer")
      .attr("stroke", "#c2c2c2")
      .attr("stroke-width", 2)
      .selectAll("g");

    this.bindLinksData();
  }

  ticked() {
    this.simulation.on("tick", () => {
      this.nodesContainer?.attr('transform', d => `translate(${d.x},${d.y})`)

      this.linksContainer
        ?.attr('d', d => linkArc(d, { isArc: false, radius: 50 }))
    });
  }

  drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  // 通过Graph操作节点或连线时进行的重新绘图方法，后续优化
  // reDraw() {
    // this.simulation = d3
    //   .forceSimulation(this.nodes)
    //   .force("charge", d3.forceManyBody())
    //   .force(
    //     "link",
    //     d3
    //       .forceLink(this.links)
    //       .id((d) => {
    //         return d.id;
    //       })
    //       .distance(this.linkDistance)
    //   )
    // .force("x", d3.forceX())
    // .force("y", d3.forceY());

    // this.ticked();
  // }

  bindNodesData() {
    this.nodesContainer = this.nodesContainer
      .data(this.nodes)
      .join("g")
      .call(this.drag(this.simulation))

    // 添加前先清除节点下所有元素
    this.nodesContainer.selectAll('circle').remove()
    this.nodesContainer.selectAll('text').remove()

    this.nodesContainer.append('circle')
      .attr("r", 8.5)
      .on("click", (event, data) => {
        console.log("点击了节点", event, data);
        this.clickNodeEvent && this.clickNodeEvent(event, data)
      });

    this.nodesContainer.append("text")
      .attr("x", -3)
      .attr("y", "1.7em")
      .text(d => d.name || d.id)
      .attr("fill", "#666")
      .attr("stroke", "#666")
      .attr("stroke-width", 1);
  }

  bindLinksData() {
    this.linksContainer = this.linksContainer
      .data(this.links)
      .join('path')
      .attr('marker-start', d => `url(#${d.source.id}-${d.target.id})`)
      .attr("stroke", d => '#666')
      .attr("fill", "none")
      .attr("style", "cursor: pointer;")
      .on("click", (event, data) => {
        this.clickLinkEvent && this.clickLinkEvent(event, data);
      });
  }

  createLabelDefs() {
    // 读取标签配置： rect 形成边框 text 设置文字， path绘制箭头；通过marker被连线引用
    let {
      background,
      borderColor,
      borderWidth,
      borderRadius,

      height,
      padding,

      fontSize,
      fontColor,

      arrowWidth,
      arrowColor,
      arrowStrokeColor } = this.options.label

    let label = this.linksLabelContainer
      .append("defs")
      .selectAll('marker')
      .data(this.links)
      .join('marker')
      .attr('id', d => `${d.source.id}-${d.target.id}`)
      .attr('refX', '-30')
      .attr('refY', height / 2)
      .attr('markerWidth', d => {
        return calcNodeRect({ text: d.label || '缺失', element: 'text', fontSize: fontSize }).width + padding * 2 + arrowWidth
      })
      .attr('markerHeight', height)
      .attr('orient', 'auto')
      .append('g')
      
    label.append('rect')
      .attr('fill', background)
      .attr('stroke', borderColor)
      .attr('stroke-width', borderWidth)
      .attr('x', borderWidth)
      .attr('y', borderWidth)
      .attr('rx', borderRadius)
      .attr('ry', borderRadius)
      .attr('height', height - 2 * borderWidth)
      .attr('width', d => {
        let width = calcNodeRect({ text: d.label, element: 'text', fontSize: fontSize }).width
        return (width === 0 ? calcNodeRect({ text: '缺失', element: 'text', fontSize: fontSize }).width : width) + padding * 2 - borderWidth * 2
      })
      

    label.append('text')
      .attr('x', padding)
      .attr('y', d => {
        return height / 2 + borderWidth
      })
      .attr('font-size', fontSize)
      .attr('fill', d => d.label ? fontColor : "red")
      .text(d => { return d.label || '缺失' })

    label.append('path')
      .attr('d', d => {
        let start = calcNodeRect({ text: d.label || '缺失', element: 'text', fontSize: fontSize }).width + padding * 2
        return `M ${start + 1} 2 L ${start + 3.5} 4 L ${start + 1} 6 z`
      })
      .attr('fill', arrowColor)
      .attr('stroke', arrowStrokeColor)
      .attr('stroke-width', 1)
  }

  createTools() {
    // 一些被公共使用的图形marker

    // 三角形
    this.svgContainer
      .append('defs')
      .append('marker')
      .attr('id', 'Triangle')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', '27')
      .attr('refY', '5')
      .attr('markerWidth', '5')
      .attr('markerHeight', '4')
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
  }

  deleteNode(id) {
    // 从数据中通过节点id删除
    this.nodes = this.nodes.filter((n) => {
      return n.id !== id;
    });
  }

  deleteLink(links) {
    // 根据index删除
    this.links = this.links.filter((l) => {
      return !links.some((rl) => rl.index === l.index);
    });
  }

  // 个性操作: Node

  /**
   * 添加节点
  */
  append(nodes, links = []) {
    this.nodes = this.nodes.concat(nodes);
    this.links = this.links.concat(links);

    this.bindNodesData();
    this.bindLinksData();
  }

  /**
   * 删除节点 
  */
  delete(id) {
    this.deleteNode(id);
    this.deleteLink(
      this.links.filter((l) => {
        return l.source.id === id || l.target.id === id;
      })
    );

    this.bindNodesData();
    this.bindLinksData();
  }
}

// 生成弯曲的弧线路径
function linkArc(d, {
  isArc, radius = 500
}) {
  const r = isArc ? Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y) + radius : 0;
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

// 计算节点的长度和宽度
function calcNodeRect({ text, element, fontSize }) {
  let container = d3.select('body').append('svg')
  let sel = container.append(element)
    .attr('font-size', fontSize)
    .text(text).node()
  let width = sel.getComputedTextLength()
  // let height = sel.getExtentOfChar(1).height
  container.remove()
  return { width }
}