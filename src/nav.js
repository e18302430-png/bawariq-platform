export const NAV_KEYS = [
  ["home", "hero"],
  ["about", "about"],
  ["services", "services"],
  ["doctors", "doctors"],
  ["departments", "departments"],
  ["journey", "journey"],
  ["appointments", "appointments"],
  ["contact", "contact"],
];

export function scrollToId(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}
