import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Graph = ({ data, onNodeClick, darkMode, selectedNodeId }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = data.graph_nodes || [];
    const links = data.graph_links || [];

    if (!nodes.length) {
      console.warn("⚠ No nodes found");
      return;
    }

    nodes.forEach((n) => (n.id = String(n.id)));
    links.forEach((l) => {
      l.source = String(l.source?.id || l.source);
      l.target = String(l.target?.id || l.target);
    });

    const colorMap = {
      core: "#3b82f6",
      sub: "#22c55e",
      contradiction: "#ef4444",
      adjacent: "#f59e0b",
      example: "#a855f7",
    };

    const width = svgRef.current.clientWidth || 1100;
    const height = 700;

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Links
    const link = svg
      .append("g")
      .attr("stroke-opacity", 0.7)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", darkMode ? "#aaa" : "#555")
      .attr("stroke-width", 1.5);

    // Nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 16)
      .attr("fill", (d) => colorMap[d.type] || "#777")
      .attr("stroke", (d) => (d.id === selectedNodeId ? "#ffff00" : darkMode ? "#ccc" : "#fff"))
      .attr("stroke-width", (d) => (d.id === selectedNodeId ? 4 : 1.5))
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("r", 20).attr("stroke-width", 3);
      })
      .on("mouseout", function (d) {
        d3.select(this).transition().duration(200).attr("r", 16).attr("stroke-width", d.id === selectedNodeId ? 4 : 1.5);
      })
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (evt, d) => onNodeClick(d, data));

    // Labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.label || d.name || d.id)
      .attr("font-size", 14)
      .attr("font-weight", "600")
      .attr("dx", 18)
      .attr("dy", 4)
      .attr("fill", darkMode ? "#e5e7eb" : "#111")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label.attr("x", (d) => d.x + 18).attr("y", (d) => d.y + 4);
    });
  }, [data, darkMode, selectedNodeId]);

  return <svg ref={svgRef} width="100%" height="700" style={{ borderRadius: "12px" }} />;
};

export default Graph;
