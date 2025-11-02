import { Component, Input } from '@angular/core';
import { GraphNode, NodeType, Edge} from '../model/model';

@Component({
  selector: 'app-exporter',
  standalone: true,
  templateUrl: './exporter.html',
  styleUrls: ['./exporter.css']
})
export class Exporter {
  @Input() nodes: GraphNode[] = [];
  @Input() edges: Edge[] = [];


  pythonCode: string | null = null;
  pythonBlobUrl: string | null = null;


  exportPython(){
    const code = this.buildLangGraphPython(this.nodes, this.edges);
    this.pythonCode = code;
    const blob = new Blob([code], { type: 'text/x-python' });
    if(this.pythonBlobUrl) { URL.revokeObjectURL(this.pythonBlobUrl); }
    this.pythonBlobUrl = URL.createObjectURL(blob);
  }


  buildLangGraphPython(nodes: any[], edges: any[]){
    const lines: string[] = [];
    lines.push('# Generated LangGraph workflow');
    lines.push('from langgraph import Graph, Node, Edge');
    lines.push('');
    lines.push('g = Graph(name="generated_workflow")');


    nodes.forEach(n => {
        const label = (n.label || n.id).replace(/"/g, '\\"');
        if(n.type === 'LLMChain'){
          const promptText = (n.prompt || '').replace(/"/g, '\\"');
          const systemText = (n.systemPrompt || '').replace(/"/g, '\\"');
          lines.push(`${n.id}_prompt = PromptTemplate(input_variables=["input"], template="${promptText}", template_format="f-string")`);
          lines.push(`${n.id} = LLMChain(llm=llm, prompt=${n.id}_prompt, output_key="${n.id}_output", system_message="${systemText}")`);
        } else {
          lines.push(`${n.id} = Node(name="${label}", type="${n.type || 'Generic'}")`);
        }
    });


    nodes.forEach(n => lines.push(`g.add_node(${n.id})`));
    edges.forEach(e => lines.push(`g.add_edge(Edge(from=${e.from}, to=${e.to}))`));


    lines.push('');
    lines.push('if __name__ == "__main__":');
    lines.push(' print("Graph created with {} nodes and {} edges".format(len(g.nodes), len(g.edges)))');


    return lines.join('\n');
  }
}
