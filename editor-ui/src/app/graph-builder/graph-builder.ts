import {Component, Input, Output, EventEmitter} from '@angular/core';


@Component({
  selector: 'app-graph-builder',
  standalone: true,
  templateUrl: './graph-builder.html',
  styleUrls: ['./graph-builder.css']
})
export class GraphBuilder {
  @Input() nodes: any[] = [];
  @Input() edges: any[] = [];
  @Output() nodesChange = new EventEmitter<any[]>();
  @Output() edgesChange = new EventEmitter<any[]>();


  private nodeDragging: any = null;
  private nodeOffset = {x: 0, y: 0};


  private edgeDraggingFrom: any = null;
  private edgeType: 'regular' | 'conditional' = 'regular';
  dragLine: { x1: number, y1: number, x2: number, y2: number } | null = null;


// Update edges from palette
  ngOnChanges() {
// No special action needed; edges input includes palette edges
  }


  startNodeDrag(ev: MouseEvent, node: any) {
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


  startEdgeDrag(ev: MouseEvent, node: any, type: 'regular' | 'conditional') {
    this.edgeDraggingFrom = node;
    this.edgeType = type;
    this.dragLine = {x1: node.x + 70, y1: node.y + 40, x2: node.x + 70, y2: node.y + 40};


    const onMove = (e: MouseEvent) => {
      if (this.dragLine) {
        this.dragLine.x2 = e.clientX;
        this.dragLine.y2 = e.clientY;
      }
    };
    const onUp = (e: MouseEvent) => {
      const targetNode = this.nodes.find(n => {
        const handleRect = {x: n.x, y: n.y, w: 1500, h: 1000};
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
        this.edges = [...this.edges, {from: this.edgeDraggingFrom.id, to: targetNode.id, type: this.edgeType}];
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

  // onCanvasMouseUp(ev: MouseEvent) {
  // }


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
}
