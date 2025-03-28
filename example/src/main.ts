import { buildNavigation, renderCase } from "./helpers";
import cases from "./cases";

buildNavigation(cases);

const search = new URLSearchParams(window.location.search);
const { layout, debug } = renderCase(search.get("case"), cases);

console.log("debug", debug);

document.body.appendChild(layout);
