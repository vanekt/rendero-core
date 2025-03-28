import { bindEvents, replacePlaceholders, bindFunction } from "./helpers";
import type {
  Components,
  Instance,
  Module,
  Node,
  NodeProps,
  RenderedLayout,
  RenderResult,
  Vars,
} from "./types";

export { bindFunction };

// TODO
export {
  Components,
  Instance,
  Module,
  Node,
  NodeProps,
  RenderedLayout,
  RenderResult,
  Vars,
};

export function createInstance(...modules: Module[]): Instance {
  const components = modules.reduce(
    (result, { name, components = {} }) => ({
      ...result,
      [name]: components,
    }),
    {} as Record<string, Components>,
  );

  const globalVars = modules.reduce(
    (result, { vars = {} }) => ({ ...result, ...vars }),
    {} as Vars,
  );

  const render = (node: Node, renderVars: Vars = {}): RenderResult => {
    const {
      module,
      type,
      props: nodeProps,
      children: nodeChildren,
      key = 0,
    } = node || {};
    const component = components?.[module]?.[type];

    if (!component) {
      throw new Error(`Wrong node type: ${module}:${type}`);
    }

    let children: RenderResult[] = [];

    const renderChildren = (extraVars: Vars = {}): RenderedLayout[] => {
      if (!Array.isArray(nodeChildren)) {
        return [];
      }

      children = nodeChildren.map((child, idx) =>
        render({ ...child, key: idx }, { ...renderVars, ...extraVars }),
      );

      return children.map((child) => child.layout);
    };

    const vars = { ...globalVars, ...renderVars };

    const props = bindEvents(
      replacePlaceholders(nodeProps, vars),
      vars,
    ) as NodeProps;

    const layout = component(
      { key, ...props },
      {
        children: nodeChildren,
        vars,
        render,
        renderChildren,
        replacePlaceholders,
      },
    );

    return { layout, children, vars };
  };

  return {
    render,
    components,
    vars: globalVars,
  };
}
