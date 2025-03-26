import { describe, test, expect } from "@jest/globals";
import { createInstance } from ".";

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
    vars: {
      one: 1,
      two: 2,
    },
  };
}

function initSecondModule() {
  return {
    name: "second",
    components: {
      foo: () => "bar",
    },
    vars: {
      foo: "bar",
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

const myModule = initMyModule();
const secondModule = initSecondModule();
const instance = createInstance(myModule, secondModule);
const placeholders = { name: "Rendero" };

describe("createInstance function", () => {
  test("correctly handles empty modules array", () => {
    const emptyInstance = createInstance();
    expect(emptyInstance.components).toEqual({});
    expect(emptyInstance.vars).toEqual({});
  });

  test("correctly handles modules without components or vars", () => {
    const instance = createInstance({ name: "empty" });
    expect(instance.components).toEqual({ empty: {} });
    expect(instance.vars).toEqual({});
  });
});

describe("instance.components", () => {
  test("correctly add all modules", () => {
    expect(instance.components).toHaveProperty(myModule.name);
    expect(instance.components).toHaveProperty(secondModule.name);
    expect(Object.keys(instance.components).length).toBe(2);
  });

  test(`correctly add "${myModule.name}" module all components`, () => {
    expect(instance.components[myModule.name]).toHaveProperty("div");
    expect(instance.components[myModule.name]).toHaveProperty("span");
    expect(instance.components[myModule.name]).toHaveProperty("hello");
    expect(instance.components[myModule.name]).toHaveProperty("eval");
    expect(Object.keys(instance.components[myModule.name]).length).toBe(
      Object.keys(myModule.components).length,
    );
  });

  test(`correctly add "${secondModule.name}" module all components`, () => {
    expect(instance.components[secondModule.name]).toHaveProperty("foo");
    expect(Object.keys(instance.components[secondModule.name]).length).toBe(
      Object.keys(secondModule.components).length,
    );
  });
});

describe("instance.vars", () => {
  test("correctly add all vars", () => {
    expect(instance.vars).toHaveProperty("one");
    expect(instance.vars).toHaveProperty("two");
    expect(instance.vars).toHaveProperty("foo");
  });
});

describe("instance.render function", () => {
  test("correctly render my.hello component", () => {
    expect(instance.render({ module: "my", type: "hello" }, placeholders)).toBe(
      "Hello, World!",
    );
  });

  test("correctly render my.div component", () => {
    const div = instance.render({ module: "my", type: "div" }, placeholders);
    expect(div.tagName).toBe("DIV");
  });

  test("correctly render my.div component with props", () => {
    const div = instance.render(
      {
        module: "my",
        type: "div",
        props: {
          title: "My {{name}}",
          style: "display: flex; flex-direction: column;",
        },
      },
      placeholders,
    );

    expect(div.getAttribute("title")).toBe("My Rendero");
    expect(div.getAttribute("style")).toBe(
      "display: flex; flex-direction: column;",
    );
  });

  test("correctly render my.div component text node child", () => {
    const div = instance.render(
      {
        module: "my",
        type: "div",
        children: [{ module: "my", type: "hello" }],
      },
      placeholders,
    );

    expect(div.textContent).toBe("Hello, World!");
  });

  test("correctly render my.div component span child", () => {
    const div = instance.render(
      {
        module: "my",
        type: "div",
        children: [
          {
            module: "my",
            type: "span",
            children: [
              { module: "my", type: "hello", props: { value: "YOU" } },
            ],
          },
          {
            module: "my",
            type: "span",
            children: [
              {
                module: "my",
                type: "hello",
                props: { value: "{{foo}}" },
              },
            ],
          },
        ],
      },
      placeholders,
    );

    expect(div.childElementCount).toBe(2);
    expect(div.firstElementChild.tagName).toBe("SPAN");
    expect(div.firstElementChild.textContent).toBe("Hello, YOU!");
    expect(div.lastElementChild.tagName).toBe("SPAN");
    expect(div.lastElementChild.textContent).toBe("Hello, bar!");
  });

  test("throws error when render unknown component", () => {
    expect(() => {
      instance.render({ module: "my", type: "unknown" }, placeholders);
    }).toThrowError("Wrong node type: my:unknown");
  });

  test("correctly render my.div component with incorrect children value", () => {
    expect(
      instance.render(
        {
          module: "my",
          type: "div",
          children: null,
        },
        placeholders,
      ).childElementCount,
    ).toBe(0);
  });

  test("throws with incorrect node value", () => {
    expect(() => {
      instance.render(null);
    }).toThrowError("Wrong node type: undefined:undefined");
    expect(() => {
      instance.render(undefined);
    }).toThrowError("Wrong node type: undefined:undefined");
    expect(() => {
      instance.render([]);
    }).toThrowError("Wrong node type: undefined:undefined");
  });

  test("throws with incorrect child value", () => {
    expect(() => {
      instance.render(
        {
          module: "my",
          type: "div",
          children: [null],
        },
        placeholders,
      );
    }).toThrowError("Wrong node type: undefined:undefined");
  });
});
