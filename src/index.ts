import { bindEvents, replacePlaceholders, bindFunction } from "./helpers";

export { bindFunction };

export function createInstance(...modules) {
  const components = modules.reduce(
    (result, { name, components = {} }) => ({
      ...result,
      [name]: components,
    }),
    {},
  );

  const globalVars = modules.reduce(
    (result, { vars = {} }) => ({ ...result, ...vars }),
    {},
  );

  const render = (node, renderVars = {}) => {
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

    let children = [];
    const renderChildren = (extraVars = {}) => {
      if (!Array.isArray(nodeChildren)) {
        return [];
      }

      children = nodeChildren.map((child, idx) =>
        render({ ...child, key: idx }, { ...renderVars, ...extraVars }),
      );

      return children.map((child) => child.layout);
    };

    const vars = { ...globalVars, ...renderVars };
    const props = bindEvents(replacePlaceholders(nodeProps, vars), vars);

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
