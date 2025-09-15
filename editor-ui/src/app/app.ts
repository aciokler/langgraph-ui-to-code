import { Component, signal } from '@angular/core';
import { Palette } from './palette/palette';
import { GraphBuilder } from './graph-builder/graph-builder';
import { Exporter } from './exporter/exporter';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [Palette, GraphBuilder, Exporter, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('editor-ui');

  nodes: any[] = [];
  edges: any[] = [];


  onAddNode(nodeDef: any){
    const id = 'n' + (this.nodes.length + 1);
    this.nodes = [...this.nodes, { id, ...nodeDef, x: 20, y: 20 }];
  }

  onAddEdge(edge: any){
    const id = 'n' + (this.edges.length + 1);
    this.edges = [...this.edges, { id, ...edge }];
  }
}
