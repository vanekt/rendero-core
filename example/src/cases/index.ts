import { initMyModule } from "../modules/my";

export default [
  {
    index: "1",
    title: "Первый кейс",
    modules: [initMyModule],
    json: {
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
    },
    vars: { name: "Rendero" },
  },
];
