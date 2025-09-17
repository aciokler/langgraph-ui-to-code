import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './palette.html',
  styleUrls: ['./palette.css'],
})
export class Palette {
  @Input() nodes: any[] = [];
  @Input() edges: any[] = [];
  @Output() addNode = new EventEmitter<any>();
  @Output() addEdgeEvent = new EventEmitter<any>();


  chainName: string = '';
  chainPrompt: string = '';
  systemPrompt: string = '';


  edgeFrom: string = '';
  edgeTo: string = '';
  edgeType: 'regular' | 'conditional' = 'regular';


  addChainNode() {
    if (this.chainName.trim() === '' || this.chainPrompt.trim() === '') return;
    const node = {
      id: this.nodes.length + 1,
      type: 'LLMChain',
      label: this.chainName,
      prompt: this.chainPrompt,
      systemPrompt: this.systemPrompt
    };
    this.addNode.emit(node);
    this.chainName = '';
    this.chainPrompt = '';
    this.systemPrompt = '';
  }


  addEdge() {
    if (this.edgeFrom && this.edgeTo && this.edgeFrom !== this.edgeTo) {
      const edge = {id: this.edges.length + 1, from: this.edgeFrom, to: this.edgeTo, type: this.edgeType};
      this.addEdgeEvent.emit(edge);
      this.edgeFrom = this.edgeTo = '';
    }
  }
}
