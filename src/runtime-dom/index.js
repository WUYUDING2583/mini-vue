export const nodeOperations = {
  createText: (text) => document.createTextNode(text),
  createElement: (tag) => document.createElement(tag),
  insert: (element, container, anchor) =>
    container.insertBefore(element, anchor || null),
  patchProp: (element, attributeName, prev, value) => {
    if (attributeName.startsWith("on")) {
      element.addEventListener(
        attributeName.slice(2).toLocaleLowerCase(),
        value
      );
    } else {
      element.setAttribute(attributeName, value);
    }
  },
  setElementText: (element, text) => (element.textContent = text),
};
