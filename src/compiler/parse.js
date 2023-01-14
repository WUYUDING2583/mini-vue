export function parse(template) {
  // 上下文
  const context = {
    source: template,
    advance(num) {
      this.source = this.source.slice(num);
    },
    advanceSpaces() {
      // 消费若干空格
      const match = /^[\t\r\n\f ]+/.exec(context.source);
      if (match) {
        context.advance(match[0].length);
      }
    },
  };

  return parseChildren(context, []);
}

// 解析子节点
function parseChildren(context, stack) {
  // 存储解析获得的所有ast节点
  let nodes = [];

  // 开启状态机，只要满足条件就会一直对字符串进行解析，状态类型取决于节点类型数量
  // 1.标签，例如<div>
  // 2.文本插值，例如{{val}}
  // 3.普通文本，例如text
  while (!isEnd(context, stack)) {
    // node保存单次解析结果
    let node;
    // 模版以<起始，可能是开始标签或者无效的结束标签
    if (context.source[0] === "<") {
      if (context.source[1] === "/") {
        // 结束标签
        console.error("无效的结束标签");
        continue;
      } else if (/[a-z]/i.test(context.source[1])) {
        // 开始标签
        node = parseElement(context, stack);
      }
    } else if (context.source.startsWith("{{")) {
      // 插值文本
      node = parseInterpolation(context);
    }

    // 没有node，则既不是标签也不是插值，所以只能是文本状态
    if (!node) {
      node = parseText(context);
    }

    // 将解析结果存入nodes
    nodes.push(node);
  }

  // 循环结束说明解析完毕
  return nodes;
}

function parseElement(context, stack) {
  // 解析开始标签
  const ele = parseTag(context);
  // 自闭和情况，不需要后续解析
  if (ele.isUnary) {
    return ele;
  }

  // 作为父级标签入栈，用于结束判断
  stack.push(ele);
  // 递归解析子节点
  ele.children = parseChildren(context, stack);
  // 子节点解析结束，父级标签出栈
  stack.pop();

  // 解析结束标签
  if (context.source.startsWith(`</${ele.tag}`)) {
    parseTag(context, "end");
  } else {
    // 非正常闭合标签
    console.error(`${ele.tag}标签缺少闭合标签`);
  }

  return ele;
}

// parseTag同时用来解析开始标签和结束标签，用type以示区分，默认是开始标签start
function parseTag(context, type = "start") {
  // 处理开始、结束标签的正则不同
  const pattern =
    type === "start"
      ? /^<([a-z][^\t\r\n\f />]*)/i
      : /^<\/([a-z][^\t\r\n\f />]*)/i;
  const match = pattern.exec(context.source);
  // 匹配成功，第一个分组的值为标签名称
  const tag = match[1];
  // 消费匹配部分全部内容，例如<div
  context.advance(match[0].length);

  // 消费标签后面空格
  context.advanceSpaces();
  // 解析属性
  const props = parseAttrs(context);

  // 消费结束，如果字符串以/>开头，说明是自闭合标签
  const isUnary = context.source.startsWith("/>");
  // 消费掉标签名后面的/>或者>
  context.advance(isUnary ? 2 : 1);
  // 返回标签节点
  return {
    type: "Element",
    tag,
    props,
    children: [],
    isUnary,
  };
}

function isEnd(context, stack) {
  // 模版内容解析完毕
  if (!context.source) {
    return true;
  }

  // 遇到结束标签，且stack中存在同名开始标签
  const parent = stack[stack.length - 1];
  if (parent && context.source.startsWith(`</${parent.tag}`)) {
    return true;
  }
}

function parseAttrs(context) {
  const props = [];
  while (!context.source.startsWith(">") && !context.source.startsWith("/>")) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
    // 1.获取属性名称
    const name = match[0];
    // 2.消费属性名,等号
    context.advance(name.length + 1);
    // 消费多余空格
    context.advanceSpaces();
    // 3.获取属性值
    let value = "";
    // 4.获取首字符
    const quote = context.source[0];
    // 判断首字符是否是引号
    const isQuote = quote === '"' || quote === "'";
    if (isQuote) {
      // 消费头一个引号
      context.advance(1);
      // 获取下一个引号
      const index = context.source.indexOf(quote);
      // 截取中间部分
      if (index > -1) {
        value = context.source.slice(0, index);
        //   消费属性值和后面的引号
        context.advance(value.length + 1);
      } else {
        console.error("缺少引号");
      }
    } else {
      const match = /^[^\t\r\n\f >]+/.exec(context.source);
      value = match[0];
      context.advance(value.length);
    }
    // 消费属性间的空格
    context.advanceSpaces();
    props.push({
      type: "Attribute",
      name,
      value,
    });
  }
  return props;
}

function parseText(context) {
  let endIndex = context.source.length;
  // 查找<
  const ltIndex = context.source.indexOf("<");
  // 查找{{
  const delimiterIndex = context.source.indexOf("{{");
  if (ltIndex > -1 && ltIndex < endIndex) {
    endIndex = ltIndex;
  }
  // 取delimiterIndex和ltIndex中较小者为结束索引
  if (delimiterIndex > -1 && delimiterIndex < endIndex) {
    endIndex = delimiterIndex;
  }
  // 截取并消费
  let content = context.source.slice(0, endIndex);
  context.advance(content.length);
  // 构造文本ast
  return {
    type: "Text",
    content,
  };
}

function parseInterpolation(context) {
  // 消费{{
  context.advance(2);
  // 查找结束}}
  const endIndex = context.source.indexOf("}}");
  // 截取表达式
  const content = context.source.slice(0, endIndex);
  // 消费内容
  // 消费}}
  context.advance(content.length + 2);
  // 构造节点
  return {
    type: "Interpolation",
    content: {
      type: "Expression",
      content,
    },
  };
}
