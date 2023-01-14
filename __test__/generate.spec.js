import { generate } from "../src/compiler/generate";
it("generate element with text", () => {
  const ast = [
    {
      type: "Element",
      tag: "div",
      props: [],
      isUnary: false,
      children: [{ type: "Text", content: "foo" }],
    },
  ];
  const code = generate(ast);
  // _c就是create element，就是虚拟dom, param2是属性，现在只有元素, param3是children,现在只有一个文本元素；
  // 有很多子元素，param3就是一个数组
  expect(code).toMatch(`return this._c('div',null,'foo')`);
});
it("generate element with expression", () => {
  const ast = [
    {
      type: "Element",
      tag: "div",
      props: [],
      isUnary: false,
      children: [
        {
          type: "Interpolation",
          content: { type: "Expression", content: "foo" },
        },
      ],
    },
  ];
  const code = generate(ast);
  expect(code).toMatch(`return this._c('div',null,this.foo)`);
});
it("generate element with muti children", () => {
  const ast = [
    {
      type: "Element",
      tag: "div",
      props: [],
      isUnary: false,
      children: [
        { type: "Text", content: "foo" },
        {
          type: "Element",
          tag: "span",
          props: [],
          isUnary: false,
          children: [{ type: "Text", content: "bar" }],
        },
      ],
    },
  ];
  const code = generate(ast);
  expect(code).toMatch(
    `return this._c('div',null,[this._v('foo'),this._c('span',null,'bar')])`
  );
});
