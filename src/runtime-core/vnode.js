import { Text } from "./createRenderer";

export function createVNode(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}

export function createTextVNode(children) {
  return createVNode(Text, null, children);
}
