import {Component, signal} from '@angular/core';
import {GraphNode, NodeType, Edge} from './model/model';
import {GraphBuilder} from './graph-builder/graph-builder';
import {Exporter} from './exporter/exporter';
import {FormsModule} from '@angular/forms';
import {Palette} from './palette/palette';

@Component({
  selector: 'app-root',
  imports: [GraphBuilder, Exporter, FormsModule, Palette],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('editor-ui');

  nodes: GraphNode[] = [
    {id: "1", name: 'Start', type: NodeType.ToolNode, prompt: 'Hello', systemPrompt: 'You are nice ai', x: 20, y: 20},
    {id: "2", name: 'End', type: NodeType.LLMChain, prompt: 'Goodbye', systemPrompt: 'You are nice ai', x: 200, y: 200}
  ];
  edges: Edge[] = [];


  onAddNode(nodeDef: GraphNode) {
    const id = 'n' + (this.nodes.length + 1);
    this.nodes = [...this.nodes, { ...nodeDef, x: 20, y: 20 }];
  }

  onAddEdge(edge: Edge){
    const id = 'n' + (this.edges.length + 1);
    this.edges = [...this.edges, { ...edge }];
  }
}
