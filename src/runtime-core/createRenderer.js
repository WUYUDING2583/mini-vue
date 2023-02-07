import { compile } from "../compiler";
import { createTextVNode, createVNode } from "./vnode";
function createRenderer(options) {
  const { createText, createElement, insert, patchProp, setElementText } =
    options;

  const patch = (vnode, container) => {
    const { tag } = vnode;
    if (typeof tag === "string") {
      // 挂载元素
      mountElement(vnode, container);
    } else if (tag === Text) {
      // 挂载文本节点
      mountTextNode(vnode, container);
    } else if (typeof tag === "object") {
      mountComponent(vnode, container);
    }
  };

  const render = (vnode, container) => {
    if (vnode) {
      // 挂载逻辑
      patch(vnode, container);
    } else {
      // 卸载逻辑
      container.innerHTML = "";
    }
    // 存储vnode作为下次更新时的oldVnode
    container._vnode = vnode;
  };

  const mountComponent = (vnode, container) => {
    const { tag } = vnode;
    let { render, template, data } = tag;
    if (!render) render = compile(template).render;
    let args = {};
    if (data) args = data();
    patch(
      render.call({ _v: createTextVNode, _c: createVNode, ...args }),
      container
    );
  };

  // 挂载文本节点
  const mountTextNode = (vnode, container) => {
    const textNode = (vnode.el = createText(vnode.children));
    insert(textNode, container);
  };

  // 挂载元素
  const mountElement = (vnode, container) => {
    const element = (vnode.el = createElement(vnode.tag));
    if (typeof vnode.props === "object" && vnode.props) {
      Object.keys(vnode.props).forEach((key) => {
        patchProp(element, key, null, vnode.props[key]);
      });
    }
    if (typeof vnode.children === "string") {
      setElementText(element, vnode.children);
      // element.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => patch(child, element));
    }
    insert(element, container);
  };

  const createApp = (tag) => {
    return {
      mount: (container) => render({ tag }, container),
    };
  };

  return {
    render,
    createApp,
  };
}

export const Text = Symbol("text");

export default createRenderer;
