let activeEffect = null;
const effectStack = [];
function effect(func, options = {}) {
  const effectFunc = () => {
    activeEffect = effectFunc;
    effectStack.push(effectFunc);
    func();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };

  effectFunc.options = options;
  effectFunc();
}

const targetMap = new WeakMap();

function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
      deps = new Set();
      depsMap.set(key, deps);
    }
    deps.add(activeEffect);
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const deps = depsMap.get(key);
    deps &&
      deps.forEach((fn) => {
        if (fn.options.scheduler) fn.options.scheduler(fn);
        else fn();
      });
  }
}
export { activeEffect, effect, track, trigger };
