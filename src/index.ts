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

  const debug = (node, renderVars = {}) => {
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
        debug({ ...child, key: idx }, { ...renderVars, ...extraVars }),
      );

      return children;
    };

    const vars = { ...globalVars, ...renderVars };
    const props = bindEvents(replacePlaceholders(nodeProps, vars), vars);

    const layout = component(
      { key, ...props },
      {
        children: nodeChildren,
        vars,
        debug,
        renderChildren,
        replacePlaceholders,
      },
    );

    return { layout, children, vars };
  };

  const render = (node, renderVars = {}, { __debugger = false } = {}) => {
    const { module, type, props: nodeProps, children, key = 0 } = node || {};
    const component = components?.[module]?.[type];

    if (!component) {
      throw new Error(`Wrong node type: ${module}:${type}`);
    }

    const renderChildren = (extraVars = {}) => {
      if (!Array.isArray(children)) {
        return [];
      }

      return children.map(
        (child, idx) =>
          render({ ...child, key: idx }, { ...renderVars, ...extraVars })
            .layout,
      );
    };

    const vars = { ...globalVars, ...renderVars };
    const props = bindEvents(replacePlaceholders(nodeProps, vars), vars);

    const layout = component(
      { key, ...props },
      {
        children,
        vars,
        render,
        renderChildren,
        replacePlaceholders,
      },
    );

    return {
      layout,
      debug: __debugger ? debug(node, renderVars) : null,
    };
  };

  return {
    debug,
    render,
    components,
    vars: globalVars,
  };
}
