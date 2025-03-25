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

  const render = (
    { module, type, props, children, key = 0 },
    renderVars = {},
  ) => {
    const component = components?.[module]?.[type];

    if (!component) {
      throw new Error(`Wrong node type: ${module}:${type}`);
    }

    const mergedVars = { ...globalVars, ...renderVars };

    return component(
      {
        key,
        ...bindEvents(replacePlaceholders(props, mergedVars), mergedVars),
      },
      {
        children,
        vars: mergedVars,
        render,
        renderChildren: (extraVars = {}) => {
          if (!Array.isArray(children)) {
            return [];
          }

          return children.map((child, idx) =>
            render({ ...child, key: idx }, { ...renderVars, ...extraVars }),
          );
        },
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
