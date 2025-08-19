import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import circular from 'graphology-layout/circular';

export function runForceAtlas2(graph: Graph, settings: any = {}): () => void {
  let running = true;
  function step() {
    if (!running) return;
    forceAtlas2.assign(graph, { iterations: 1, settings });
    requestAnimationFrame(step);
  }
  step();
  return () => {
    running = false;
  };
}

export function applyCircular(graph: Graph) {
  circular.assign(graph);
}
