# Rendero UI Library ![npm version](https://img.shields.io/npm/v/@vanekt/rendero-core)

A library for dynamic UI rendering based on mappers and JSON markup. It allows updating the UI without redeploying the frontend, making customization fast and flexible.

## Features

- **Dynamic Rendering**: Generates UI from JSON input.
- **Modular Plugins**: Extend functionality with custom plugins.
- **Custom Components**: Define how elements are rendered.
- **No Redeployment Needed**: Instantly apply UI changes without redeploying.

## Installation

To install the library and required dependencies, run:

```bash
npm install @vanekt/rendero-core
```

## Usage

You can create an instance of the UI renderer by combining multiple plugins and configuring the necessary settings. Here's a simple example of how to do this:

```javascript
import { createInstance } from "@vanekt/rendero-core";

// Create a custom module that defines rendering rules for components:
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

// createNode is a generic function for creating similar components:
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

// Create an instance using our custom module
const instance = createInstance(initMyModule());

// Define the UI structure as JSON
const json = {
  module: "my",
  type: "div",
  props: {
    id: "my-div",
    title: "My DIV",
    style: "display: flex; flex-direction: column;",
  },
  children: [
    {
      module: "my",
      type: "span",
      props: {
        style: "color: red;",
      },
      children: [
        {
          module: "my",
          type: "hello",
          props: { value: "Universe" },
        },
      ],
    },
    {
      module: "my",
      type: "hello",
    },
    {
      module: "my",
      type: "eval",
      props: {
        code: 'console.log("Hi, {{name}}!")',
      },
    },
  ],
};

// Add placeholders, they will be available in each component's props in the following format: {{name}}
const placeholders = { name: "Rendero" };

// Render the ui tree
const result = instance.render(json, placeholders);

// Append the rendered layout to the document body
document.body.appendChild(result.layout);
```

As a result, we will get the following HTML markup:

```html
<div
  key="0"
  id="my-div"
  title="My DIV"
  style="display: flex; flex-direction: column;"
>
  <span key="0" style="color: red;">Hello, Universe!</span>
  "Hello, World!"
  <script>
    (function () {
      new Function("vars", console.log("Hi, Rendero!"))();
    })();
  </script>
</div>
```

## Ready-to-Use Modules

You don’t have to start from scratch—there are already some ready-made modules you can use:

- [**rendero-react**](https://github.com/vanekt/rendero-react) – A module adapted for React. It’s still incomplete, but you can check out its implementation and use it as a base for your own module.
- [**rendero-screen**](https://github.com/vanekt/rendero-screen) – A set of components for loading and rendering JSON markup from a remote source.
- [**rendero-react-router**](https://github.com/vanekt/rendero-react-router) – A mapper for rendering `react-router v5` components (**deprecated**).

These modules can save you time and give you a solid starting point for building your own extensions.
