import {Component, Input, Output, EventEmitter} from '@angular/core';
import { GraphNode, Edge } from '../model/model';


@Component({
  selector: 'app-graph-builder',
  standalone: true,
  templateUrl: './graph-builder.html',
  styleUrls: ['./graph-builder.css']
})
export class GraphBuilder {
  @Input() nodes: GraphNode[] = [];
  @Input() edges: Edge[] = [];
  @Output() nodesChange = new EventEmitter<GraphNode[]>();
  @Output() edgesChange = new EventEmitter<Edge[]>();


  private nodeDragging: any = null;
  private nodeOffset = {x: 0, y: 0};

  private WIDTH = 170;
  private HEIGHT = 118;
  private HEADER_HEIGHT = 10;
  private FOOTER_HEIGHT = 10;

  private edgeDraggingFrom: any = null;
  private edgeDragTarget: any = null;
  private edgeType: 'regular' | 'conditional' = 'regular';
  dragLine: { x1: number, y1: number, x2: number, y2: number } | null = null;

// Update edges from palette
  ngOnChanges() {
// No special action needed; edges input includes palette edges
  }


  startNodeDrag(ev: MouseEvent, node: GraphNode) {
    ev.stopPropagation();
    this.nodeDragging = node;
    this.nodeOffset.x = ev.clientX - node.x;
    this.nodeOffset.y = ev.clientY - node.y;
    console.log(this.nodeDragging);


    const onMove = (e: MouseEvent) => {
      if (this.nodeDragging) {
        this.nodeDragging.x = e.clientX - this.nodeOffset.x;
        this.nodeDragging.y = e.clientY - this.nodeOffset.y;
        this.nodesChange.emit([...this.nodes]);
      }
    };


    const onUp = () => {
      this.nodeDragging = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };


    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }


  startEdgeDrag(ev: MouseEvent, node: GraphNode, type: 'regular' | 'conditional') {
    this.edgeDragTarget = ev.target as HTMLElement
    this.edgeDraggingFrom = node;
    this.edgeType = type;
    this.dragLine = {
      x1: node.x + (this.WIDTH / 2),
      y1: node.y + (this.HEIGHT / 2),
      x2: node.x + ev.clientX,
      y2: node.y + ev.clientY
    };


    const onMove = (e: MouseEvent) => {
      if (this.dragLine) {
        this.dragLine.x2 = e.clientX;
        this.dragLine.y2 = e.clientY;
      }
    };
    const onUp = (e: MouseEvent) => {
      const targetNode = this.nodes.find(n => {
        const handleRect = {x: n.x, y: n.y, w: this.WIDTH, h: this.HEIGHT};
        console.log(handleRect, e.clientX, e.clientY, n);
        return e.clientX >= handleRect.x && e.clientX <= handleRect.x + handleRect.w && e.clientY >= handleRect.y && e.clientY <= handleRect.y + handleRect.h;
      });
      console.log('targetNode: ', targetNode);
      if (targetNode && targetNode.id !== this.edgeDraggingFrom.id) {
        const existingEdge = this.edges.find(n => {
          return n.from == this.edgeDraggingFrom.id && n.to == targetNode.id;
        })
        if (existingEdge) {
          return;
        }

        this.edges = [...this.edges, new Edge("", this.edgeDraggingFrom.id, targetNode.id, this.edgeType)];
        this.edgesChange.emit(this.edges);
      }
      this.edgeDraggingFrom = null;
      this.dragLine = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };


    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }


  onCanvasMouseMove(ev: MouseEvent) {
    if (this.dragLine) {
      this.dragLine.x2 = ev.clientX;
      this.dragLine.y2 = ev.clientY;
    }
  }

  onCanvasMouseUp(ev: MouseEvent) {
    // do nothing now
  }


  remove(n: any, ev: MouseEvent) {
    ev.stopPropagation();
    this.nodes = this.nodes.filter(x => x.id !== n.id);
    this.edges = this.edges.filter(e => e.from !== n.id && e.to !== n.id);
    this.nodesChange.emit(this.nodes);
    this.edgesChange.emit(this.edges);
  }

  getNode(id: string) {
    return this.nodes.find(x => x.id === id) || {x: 0, y: 0};
  }

  getPath(edge: any): string {
    const from = this.getNode(edge.from);
    const to = this.getNode(edge.to);

    return this.calculateBezierToNodePerimeter(from, to);
  }

  // bezierPath(from: any, to: any) {
  //   const startDiffX = from.x - to.x;
  //   const endDiffY = from.y - to.y;
  //
  //   // default
  //   var startX = from.x + (this.WIDTH / 2); // center of source node
  //   var startY = from.y + this.HEIGHT + 10;
  //   var endX = to.x + (this.WIDTH / 2);     // center of target node
  //   var endY = to.y;
  //
  //   if (endDiffY > 0) {
  //     endY = to.y + (this.HEIGHT + 10);
  //   }
  //
  //   // Control points for a smooth horizontal curve
  //   const dx = Math.abs(endX - startX) * 0.1;
  //   const controlX1 = startX + dx;
  //   const controlY1 = startY;
  //   const controlX2 = endX - dx;
  //   const controlY2 = endY;
  //
  //   return `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;
  // }
  //
  // bezierPath2(from: any, to: any) {
  //   const startX = from.x + 60; // center of source node
  //   const startY = from.y + 30;
  //   const endX = to.x + 60;     // center of target node
  //   const endY = to.y + 30;
  //
  //   // Vector from start → end
  //   const dx = endX - startX;
  //   const dy = endY - startY;
  //
  //   // Control point offset: extend in direction of the vector
  //   const offset = Math.sqrt(dx * dx + dy * dy) * 0.5; // 50% of distance
  //
  //   const controlX1 = startX + dx * 0.5; // push forward along the line
  //   const controlY1 = startY + dy * 0.0; // keep near startY if you want smoother curves
  //   const controlX2 = endX - dx * 0.5;
  //   const controlY2 = endY - dy * 0.0;
  //
  //   return `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;
  // }
  //
  // bezierPath3(from: any, to: any) {
  //   const startX = from.x + 60; // center of source node
  //   const startY = from.y + 30;
  //   const endX = to.x + 60;     // center of target node
  //   const endY = to.y + 30;
  //
  //   // Vector from start → end
  //   const dx = endX - startX;
  //   const dy = endY - startY;
  //
  //   // Control point offset: extend in direction of the vector
  //   const offset = Math.sqrt(dx * dx + dy * dy) * 0.5; // 50% of distance
  //
  //   const controlX1 = startX + dx * 0.25;
  //   const controlY1 = startY + dy * 0.25;
  //   const controlX2 = startX + dx * 0.75;
  //   const controlY2 = startY + dy * 0.75;
  //
  //   return `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;
  // }
  //
  // bezierPath4(from: any, to: any) {
  //   const startDiffX = from.x - to.x;
  //   const endDiffY = from.y - to.y;
  //
  //   // default
  //   var startX = from.x + (this.WIDTH / 2); // center of source node
  //   var startY = from.y + (this.HEIGHT / 2);
  //   var endX = to.x + (this.WIDTH / 2);     // center of target node
  //   var endY = to.y + (this.HEIGHT / 2);
  //
  //
  //   // Control points for a smooth horizontal curve
  //   const dx = Math.abs(endX - startX) * 0.1;
  //   const controlX1 = startX + dx;
  //   const controlY1 = startY;
  //   const controlX2 = endX - dx;
  //   const controlY2 = endY;
  //
  //   return `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;
  // }

  calculateBezierToNodePerimeter(from: any, to: any): string {
    const nodeWidth = this.WIDTH; // match your node width
    const nodeHeight = this.HEIGHT; // match your node height

    // centers
    const fromCx = from.x + this.WIDTH / 2;
    const fromCy = from.y + this.HEIGHT / 2;
    const toCx = to.x + this.WIDTH / 2;
    const toCy = to.y + this.HEIGHT / 2;

    const dx = toCx - fromCx;
    const dy = toCy - fromCy;

    // direction vector normalized
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    // function to clip point to rectangle perimeter
    const clipToRect = (cx: number, cy: number, w: number, h: number, dirX: number, dirY: number) => {
      const hw = w / 2;
      const hh = h / 2;

      // scale factors for x and y
      const tx = dirX !== 0 ? hw / Math.abs(dirX) : Infinity;
      const ty = dirY !== 0 ? hh / Math.abs(dirY) : Infinity;

      // choose the smaller scale (closest side intersection)
      const t = Math.min(tx, ty);

      return {
        x: cx + dirX * t,
        y: cy + dirY * t
      };
    };

    // compute perimeter points
    const start = clipToRect(fromCx, fromCy, nodeWidth, nodeHeight, ux, uy);
    const end = clipToRect(toCx, toCy, nodeWidth, nodeHeight, -ux, -uy);

    // control points along the line, 25% and 75%
    // const controlX1 = start.x + dx * 0.25;
    // const controlY1 = start.y + dy * 0.25;
    // const controlX2 = start.x + dx * 0.75;
    // const controlY2 = start.y + dy * 0.75;
    const controlX1 = start.x + dx * 0.5; // push forward along the line
    const controlY1 = start.y + dy * 0.0; // keep near startY if you want smoother curves
    const controlX2 = end.x - dx * 0.5;
    const controlY2 = end.y - dy * 0.0;

    return `M ${start.x},${start.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${end.x},${end.y}`;
  }

  getPreviewPath(): string {
    const nodeWidth = 120;
    const nodeHeight = 60;

    const target = this.edgeDragTarget;
    const rect = target.getBoundingClientRect();

    const mouseX = this.dragLine != undefined ? this.dragLine.x2 : this.edgeDraggingFrom.x;
    const mouseY = this.dragLine != undefined ? this.dragLine.y2 : this.edgeDraggingFrom.y;

    const fromCx = this.edgeDraggingFrom.x + nodeWidth / 2;
    const fromCy = this.edgeDraggingFrom.y + nodeHeight / 2;

    const dx = mouseX - fromCx;
    const dy = mouseY - fromCy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    // clip start point to source perimeter
    const clipToRect = (cx: number, cy: number, w: number, h: number, dirX: number, dirY: number) => {
      const hw = w / 2;
      const hh = h / 2;
      const tx = dirX !== 0 ? hw / Math.abs(dirX) : Infinity;
      const ty = dirY !== 0 ? hh / Math.abs(dirY) : Infinity;
      const t = Math.min(tx, ty);
      return { x: cx + dirX * t, y: cy + dirY * t };
    };

    const start = clipToRect(fromCx, fromCy, nodeWidth, nodeHeight, ux, uy);

    // end = mouse point, pushed slightly outward so arrowhead sits off the cursor
    const offset = 10;
    // const end = { x: mouseX + ux * offset, y: mouseY + uy * offset };
    const end = { x: mouseX, y: mouseY };

    // control points
    const controlX1 = start.x + dx * 0.25;
    const controlY1 = start.y + dy * 0.25;
    const controlX2 = end.x - dx * 0.25;
    const controlY2 = end.y - dy * 0.25;

    return `M ${start.x},${start.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${end.x},${end.y}`;
  }
}
