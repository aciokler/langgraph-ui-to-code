import {Component, Output, EventEmitter} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './palette.html',
  styleUrls: ['./palette.css'],
})
export class Palette {
  @Output() addNode = new EventEmitter<any>();
  @Output() addEdgeEvent = new EventEmitter<any>();


  chainName: string = '';
  chainPrompt: string = '';
  systemPrompt: string = '';


  edgeFrom: string = '';
  edgeTo: string = '';
  edgeType: 'regular' | 'conditional' = 'regular';


  nodes: any[] = [];
  edges: any[] = [];

  constructor() {
    this.nodes = [
      {id: '1', label: 'Start', type: 'LLMChain', prompt: 'Hello', systemPrompt: '', x: 100, y: 120},
      {id: '2', label: 'End', type: 'LLMChain', prompt: 'Goodbye', systemPrompt: '', x: 420, y: 220}
    ];
    this.addNode.emit(this.nodes[0]);
    this.addNode.emit(this.nodes[1]);
    this.edges = [
      {from: '1', to: '2', type: 'regular'}
    ];
    this.addEdgeEvent.emit(this.edges[1]);
  }


  addChainNode() {
    if (this.chainName.trim() === '' || this.chainPrompt.trim() === '') return;
    const node = {
      id: this.nodes.length + 1,
      type: 'LLMChain',
      label: this.chainName,
      prompt: this.chainPrompt,
      systemPrompt: this.systemPrompt
    };
    this.nodes.push(node);
    this.addNode.emit(node);
    this.chainName = '';
    this.chainPrompt = '';
    this.systemPrompt = '';
  }


  addEdge() {
    if (this.edgeFrom && this.edgeTo && this.edgeFrom !== this.edgeTo) {
      const edge = {id: this.edges.length + 1, from: this.edgeFrom, to: this.edgeTo, type: this.edgeType};
      this.edges.push(edge);
      this.addEdgeEvent.emit(edge);
      this.edgeFrom = this.edgeTo = '';
    }
  }
}
