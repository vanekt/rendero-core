import { createInstance } from "../../src/index";

function createNavLink(title, idx) {
  const node = document.createElement("a");

  const attr = document.createAttribute("href");
  attr.value = `?case=${idx}`;
  node.setAttributeNode(attr);

  node.innerText = title;

  return node;
}

export function buildNavigation(cases) {
  cases.forEach((item) => {
    const link = createNavLink(item.title, item.index);
    document.querySelector("#nav").appendChild(link);
  });
}

export function renderCase(index, cases) {
  const currentCase = cases.find((item) => item.index === index);
  if (!currentCase) {
    const result = document.createElement("span");
    result.innerText = "Please, select case";
    return result;
  }

  const instance = createInstance(
    ...currentCase.modules.map((module) => module()),
  );

  return instance.render(currentCase.json, currentCase.vars);
}
