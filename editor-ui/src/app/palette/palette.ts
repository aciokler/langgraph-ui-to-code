import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GraphNode, Edge, NodeType} from '../model/model';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './palette.html',
  styleUrls: ['./palette.css'],
})
export class Palette {
  @Input() nodes: GraphNode[] = [];
  @Input() edges: Edge[] = [];
  @Output() addNode = new EventEmitter<GraphNode>();
  @Output() addEdgeEvent = new EventEmitter<Edge>();


  chainName: string = '';
  chainPrompt: string = '';
  systemPrompt: string = '';


  edgeFrom: string = '';
  edgeTo: string = '';
  edgeType: 'regular' | 'conditional' = 'regular';


  addChainNode() {
    if (this.chainName.trim() === '' || this.chainPrompt.trim() === '') return;
    const node: GraphNode = {
      id: this.nodes.length + 1 + "",
      type: NodeType.LLMChain,
      name: this.chainName,
      prompt: this.chainPrompt,
      systemPrompt: this.systemPrompt,
      x: 10,
      y: 10,
    };
    this.addNode.emit(node);
    this.chainName = '';
    this.chainPrompt = '';
    this.systemPrompt = '';
  }


  addEdge() {
    if (this.edgeFrom && this.edgeTo && this.edgeFrom !== this.edgeTo) {
      const edge = new Edge("", this.edgeFrom, this.edgeTo, this.edgeType);
      this.addEdgeEvent.emit(edge);
      this.edgeFrom = this.edgeTo = '';
    }
  }
}
