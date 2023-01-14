export function generate(ast) {
  // 递归ast
  const code = genNode(ast[0]);
  return `return ${code}`;
}

function genNode(ast) {
  // 判断节点类型执行不同的生成逻辑
  switch (ast.type) {
    case "Element":
      return genElement(ast);
    case "Text":
      return genText(ast);
    case "Interpolation":
      return genText(ast.content);
    default:
      return "";
  }
}

function genElement(ast) {
  // 获取标签名称
  const tag = ast.tag;
  // 属性
  const props = genProps(ast);
  // 递归子元素
  const children = genChildren(ast);
  return `this._c('${tag}',${props}${children ? `,${children}` : ""})`;
}

function genProps(ast) {
  // TODO
  return null;
}

function genChildren(ast) {
  // 获取children
  // 看children类型
  // 1.若果只有一个Text类型的子元素，_c('div',null,'foo')
  // 2.其他情况生成数组，_c('div',null,[...])
  const { children } = ast;
  if (children.length === 0) return "";
  if (
    children.length === 1 &&
    (children[0].type === "Text" || children[0].type === "Interpolation")
  ) {
    if (children[0].type === "Text") {
      return `'${children[0].content}'`;
    } else if (children[0].type === "Interpolation") {
      return `this.${children[0].content.content}`;
    }
  } else {
    const strs = children.map((child) => genNode(child)).join(",");
    return `[${strs}]`;
  }
}

function genText(ast) {
  // 1.表达式
  // 2.纯文本
  let content = "";
  if (ast.type === "Text") {
    content = `'${ast.content}'`;
  } else if (ast.type === "Expression") {
    content = `this.${ast.content}`;
  }
  return `this._v(${content})`;
}
