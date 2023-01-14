import { activeEffect, trigger, track } from "./effect";
function reactive(params) {
  const proxy = new Proxy(params, {
    get(target, property, receiver) {
      const result = Reflect.get(target, property, receiver);
      track(target, property);
      return result;
    },
    set(target, property, val) {
      const result = Reflect.set(target, property, val);
      trigger(target, property);
      return result;
    },
    defineProperty(target, property) {
      const result = Reflect.defineProperty(target, property);
      trigger(target, property);
      return result;
    },
  });
  return proxy;
}

export default reactive;
