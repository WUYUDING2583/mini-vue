import { parse } from "../src/compiler/parse";
describe("compiler", () => {
  it("parse element", () => {
    const template = "<div></div>";
    const ast = parse(template);
    expect(ast[0]).toEqual({
      tag: "div",
      type: "Element",
      props: [],
      children: [],
      isUnary: false,
    });
  });

  //   it("parse unary element", () => {
  //     const template = "<img/>";
  //     const ast = parse(template);
  //     expect(ast[0]).toEqual({
  //       tag: "img",
  //       type: "Element",
  //       props: [],
  //       children: [],
  //       isUnary: true,
  //     });
  //   });

  //   it("parse nested elements", () => {
  //     const template = "<div><span></span></div>";
  //     const ast = parse(template);
  //     expect(ast[0]).toEqual({
  //       tag: "div",
  //       type: "Element",
  //       props: [],
  //       children: [
  //         {
  //           tag: "span",
  //           type: "Element",
  //           props: [],
  //           children: [],
  //           isUnary: false,
  //         },
  //       ],
  //       isUnary: false,
  //     });
  //   });

  it("parse props and directive", () => {
    const template = '<div id="foo" v-show="isShow"></div>';
    const ast = parse(template);
    expect(ast[0]).toEqual({
      tag: "div",
      type: "Element",
      props: [
        {
          type: "Attribute",
          name: "id",
          value: "foo",
        },
        {
          type: "Attribute",
          name: "v-show",
          value: "isShow",
        },
      ],
      children: [],
      isUnary: false,
    });
  });

  it("parse plain text", () => {
    const template = "<div>some text</div>";
    const ast = parse(template);
    expect(ast[0]).toEqual({
      tag: "div",
      type: "Element",
      props: [],
      children: [
        {
          type: "Text",
          content: "some text",
        },
      ],
      isUnary: false,
    });
  });

  it("parse interpolation", () => {
    const template = "<div>{{foo}}</div>";
    const ast = parse(template);
    expect(ast[0]).toEqual({
      tag: "div",
      type: "Element",
      props: [],
      children: [
        {
          type: "Interpolation",
          content: {
            type: "Expression",
            content: "foo",
          },
        },
      ],
      isUnary: false,
    });
  });
});
