// const d3 = window.d3;
export class ForceGraph {
  mapId = "";
  nodes = [];
  links = [];
  options = {
    width: 100,
    height: 100,
  };

  // 越小越聚团
  linkDistance = 180;

  // DOM结构：SVG -> G -> nodesG、linksG ....
  svgContainer = null;
  // 主空间
  graphContainer = null;
  nodesContainer = null;
  linksContainer = null;

  simulation = null;

  constructor(mapId = "", nodes = [], links = [], options = {}) {
    this.mapId = mapId;
    this.nodes = nodes;
    this.links = links;
    this.options = {
      ...this.options,
      ...options,
    };

    // 创建zoom
    this.createSvgContainer();

    this.createSimulation();

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
      .force("x", d3.forceX())
      .force("y", d3.forceY());
  }

  createNodesContainer() {
    this.nodesContainer = this.graphContainer
      .append("g")
      .attr("class", "nodesContainer")
      .attr("fill", "#fff000")
      .attr("stroke", "#000")
      .attr("stroke-width", 10)
      .selectAll("circle");

    this.bindNodesData();
  }

  createLinksContainer() {
    this.linksContainer = this.graphContainer
      .append("g")
      .attr("stroke", "#c2c2c2")
      .attr("stroke-width", 2)
      .selectAll("line");

    this.bindLinksData();
  }

  ticked() {
    this.simulation.on("tick", () => {
      this.nodesContainer?.attr("cx", (d) => d.x)?.attr("cy", (d) => d.y);

      this.linksContainer
        ?.attr("x1", (d) => d.source.x)
        ?.attr("y1", (d) => d.source.y)
        ?.attr("x2", (d) => d.target.x)
        ?.attr("y2", (d) => d.target.y);
    });
  }

  drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
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

  // 通过Graph操作
  reDraw() {
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force("charge", d3.forceManyBody())
      .force(
        "link",
        d3
          .forceLink(this.links)
          .id((d) => {
            return d.id;
          })
          .distance(this.linkDistance)
      )
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    this.ticked();
  }

  bindNodesData() {
    this.nodesContainer = this.nodesContainer
      .data(this.nodes)
      .join("circle")
      .attr("r", 8.5)
      .call(this.drag(this.simulation))
      .on("click", (event, data) => {
        console.log("点击了节点", event, data);
        this.delete(data.id);
      });
  }

  bindLinksData() {
    this.linksContainer = this.linksContainer
      .data(this.links)
      .join("line")
      .on("click", (event, data) => {
        console.log("点击了边", event, data);
      });
  }

  deleteNode(id) {
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
  append(nodes, links = []) {
    this.nodes = this.nodes.concat(nodes);
    this.links = this.links.concat(links);

    this.bindNodesData();
    this.bindLinksData();

    this.reDraw();
  }

  delete(id) {
    this.deleteNode(id);
    this.deleteLink(
      this.links.filter((l) => {
        return l.source.id === id || l.target.id === id;
      })
    );

    this.bindNodesData();
    this.bindLinksData();

    // 是否启动re-draw
    this.reDraw();
  }

  edit() {}
}
