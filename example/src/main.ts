import { buildNavigation, renderCase } from "./helpers";
import cases from "./cases";

buildNavigation(cases);

const search = new URLSearchParams(window.location.search);
const result = renderCase(search.get("case"), cases);

console.log("debug", result);

document.body.appendChild(result.layout);
