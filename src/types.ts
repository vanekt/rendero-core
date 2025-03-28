export type NodePropValue = unknown;

export type NodeProps = Record<string, NodePropValue>;

export type NodeKey = string | number;
export interface Node {
  module: string;
  type: string;
  props?: NodeProps;
  children?: Node[];
  key?: NodeKey;
}

export type RenderedLayout = unknown;

export type Vars = Record<string, unknown>;

export type ComponentRenderer = (
  props: NodeProps,
  vars: Vars,
) => RenderedLayout;

export type Components = Record<string, ComponentRenderer>;

export interface Module {
  name: string;
  components: Components;
  vars: Record<string, unknown>;
}

export interface Instance {
  render: (node: Node, renderVars: Vars) => RenderResult;
  components: Record<string, Components>;
  vars: Vars;
}

export interface RenderResult {
  children: RenderResult[];
  layout: RenderedLayout;
  vars: Vars;
}
