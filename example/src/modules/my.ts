function initMyModule() {
  return {
    name: "my",
    components: {
      hello: ({ value }) => `Hello, ${value || "World"}!`,
      div: createNode("div"),
      span: createNode("span"),
      eval: ({ code }) => {
        const node = document.createElement("script");

        node.textContent = `
            (function() {
              new Function(${code})();
            })();
          `;

        return node;
      },
    },
  };
}

function createNode(name) {
  return (props, { renderChildren }) => {
    const node = document.createElement(name);

    Object.keys(props || {}).forEach((key) => {
      const attr = document.createAttribute(key);
      attr.value = props[key];
      node.setAttributeNode(attr);
    });

    node.append(...renderChildren());

    return node;
  };
}

export { initMyModule };
