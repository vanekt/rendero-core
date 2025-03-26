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
    const { module, type, props: nodeProps, children, key = 0 } = node || {};
    const component = components?.[module]?.[type];

    if (!component) {
      throw new Error(`Wrong node type: ${module}:${type}`);
    }

    const renderChildren = (extraVars = {}) => {
      if (!Array.isArray(children)) {
        return [];
      }

      return children.map((child, idx) =>
        render({ ...child, key: idx }, { ...renderVars, ...extraVars }),
      );
    };

    const vars = { ...globalVars, ...renderVars };
    const props = bindEvents(replacePlaceholders(nodeProps, vars), vars);

    return component(
      { key, ...props },
      {
        children,
        vars,
        render,
        renderChildren,
        replacePlaceholders,
      },
    );
  };

  return {
    render,
    components,
    vars: globalVars,
  };
}
