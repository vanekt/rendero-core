import { buildNavigation, renderCase } from "./helpers";
import cases from "./cases";

buildNavigation(cases);

const search = new URLSearchParams(window.location.search);
const template = renderCase(search.get("case"), cases);

document.body.appendChild(template);
