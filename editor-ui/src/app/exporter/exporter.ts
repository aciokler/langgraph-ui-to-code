import {Component, Input} from '@angular/core';
import {Edge, GraphNode, NodeType} from '../model/model';

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


  buildLangGraphPython(nodes: GraphNode[], edges: Edge[]){
    const lines: string[] = [];
    // imports
    lines.push('# Generated LangGraph workflow');
    lines.push('from langgraph.graph import StateGraph, START, END\n\n');

    // state class
    lines.push(
      "class MessagesState(TypedDict):\n" +
      "    messages: Annotated[list[AnyMessage], operator.add]\n\n");

    // graph creation
    lines.push('graph = StateGraph(MessagesState)');

    // create model
    lines.push(
      "model = init_chat_model(\n" +
      "    \"openai:gpt-4o-mini\",\n" +
      "    temperature=0\n" +
      ")\n\n");

    lines.push(
      "def node_llm_call(state: dict, system_prompt):\n" +
      "    \"\"\"LLM decides whether to call a tool or not\"\"\"\n" +
      "\n" +
      "  return {\n" +
      "    \"messages\": [\n" +
      "        model.invoke(\n" +
      "            [\n" +
      "                SystemMessage(\n" +
      "                    content=f\"{system_prompt}\"\n" +
      "                )\n" +
      "            ]\n" +
      "            + state[\"messages\"]\n" +
      "        )\n" +
      "    ],\n" +
      "    \"llm_calls\": state.get('llm_calls', 0) + 1\n" +
      "  }\n\n");

    // nodes definitions
    nodes.forEach(n => {
        const label = (n.name || n.id).replace(/"/g, '\\"');
        if(n.type === NodeType.LLMChain){
          const promptText = (n.prompt || '').replace(/"/g, '\\"');
          const systemText = (n.systemPrompt || '').replace(/"/g, '\\"');



          // define the LLM chain node

        } else {
          lines.push(`${n.id} = Node(name="${label}", type="${n.type || 'Generic'}")`);
        }
    });


    // add nodes to graph
    nodes.forEach(n => lines.push(`g.add_node(${n.id})`));

    // add edges to graph
    edges.forEach(e => lines.push(`g.add_edge(Edge(from=${e.from}, to=${e.to}))`));

    lines.push('');

    return lines.join('\n');
  }
}
