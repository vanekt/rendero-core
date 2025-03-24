import { bindEvents, replacePlaceholders, bindFunction } from "./helpers";

export { bindFunction };

export function createInstance(...modules) {
  const COMPONENTS = modules.reduce(
    (result, { name, components = {} }) => {
      return {
        ...result,
        [name]: components,
        __legacy: {
          ...result.__legacy,
          ...components,
        },
      };
    },
    {
      __legacy: {},
    },
  );

  const VARS = modules.reduce(
    (result, { vars = {} }) => ({ ...result, ...vars }),
    {},
  );

  const render = (node = {}, _vars = {}) => {
    const { module, type, props, children, key = 0 } = node;

    const component =
      module && COMPONENTS[module]
        ? COMPONENTS[module][type]
        : COMPONENTS.__legacy[type];

    if (!component) {
      throw new Error(`Wrong node type: ${type}`);
    }

    const vars = { ...VARS, ..._vars };

    return component(
      {
        key,
        ...bindEvents(replacePlaceholders(props, vars), vars),
      },
      {
        children,
        vars,
        render,
        renderChildren: (__vars = {}) => {
          if (!Array.isArray(children)) {
            return null;
          }

          return children.map((child, idx) =>
            render({ ...child, key: idx }, { ..._vars, ...__vars }),
          );
        },
        replacePlaceholders,
      },
    );
  };

  return {
    components: COMPONENTS,
    vars: VARS,
    render,
  };
}
