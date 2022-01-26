import { isFunction, isObject } from "lodash";
import get from "lodash.get";
import { isEmptyObject, wrapInArray } from "./utils";

 function copyAugment(target, src) {
  Object.keys(src).forEach((key) => {
    if (!key[src]) return;
    def(target, key, key[src]);
  });
}

function protoAugment(target, src) {
  target.__proto__ = src;
}

 function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

function initVmData(path, init, name) {
  const targetList = get(this, path);
  const initList = init.bind(this);

  if (!Array.isArray(targetList)) throw new Error(`[selectable]: ${name}不是一个数组`);

  const res = targetList.map(initList);
  this.$set(this, name, res);
  const vmData = res;

  const { push, pop, shift, unshift, splice, sort, reverse } = targetList.__proto__ ?? targetList;

  const arrayMethods = Object.create(Array.prototype);

  arrayMethods.push = function (...args) {
    vmData.push(...args.map(initList));
    return push.apply(targetList, args);
  };

  arrayMethods.pop = function () {
    vmData.pop();
    return pop.apply(targetList);
  };

  arrayMethods.shift = function () {
    vmData.shift();
    return shift.apply(targetList);
  };
  arrayMethods.unshift = function (...args) {
    vmData.unshift(...args.map(initList));
    return unshift.apply(targetList, args);
  };
  arrayMethods.splice = function (start, deleteCount, ...args) {
    vmData.splice(start, deleteCount, ...args.map(initList));
    return splice.call(targetList, start, deleteCount, ...args);
  };
  arrayMethods.sort = function (compareFunction) {
    vmData.sort((a, b) => compareFunction(a.data, b.data));
    return sort.call(targetList, compareFunction);
  };
  arrayMethods.reverse = function (...args) {
    vmData.reverse(...args.map(initList));
    return reverse.apply(targetList, args);
  };

  const augment = targetList.__proto__ ? protoAugment : copyAugment;

  augment(targetList, arrayMethods);
}

export function createVmMixin(path, { name = "vmData" } = {}) {
  const obj = { __attrs__: {}, __fns__: [] };

  class CreateMixin {
    data;
    mixins = [];
    computed;
    watch;

    constructor() {
      this.data = () => ({
        [name]: [],
      });
      this.computed = {
        __vmData__() {
          return get(this, name);
        },
      };

      this.watch = {
        [path]: {
          immediate: true,
          handler(val, oldVal) {
            if (val === oldVal) return;
            initVmData.call(
              this,
              path,
              function init(item, index, arr) {
                const memoryItem = oldVal?.find((oldItem) => oldItem === item);
                const parent = memoryItem?.__vmData__;
                if (parent) return parent;

                const attr = (obj.__attrs__);
                const res = { data: item };

                Object.keys(attr).forEach((key) => {
                  const value = attr[key];
                  if (key === "data") return console.warn(`[createVmMixin]: attrs 不能有 data`);

                  res[key] = isFunction(value) ? value.call(this, item, index, arr) : value;
                });

                const vm = this;
                Reflect.defineProperty(res, "data", {
                  get() {
                    return item;
                  },
                  set(val) {
                    vm.$set(arr, index, val);
                  },
                });
                if (isObject(item)) {
                  Reflect.defineProperty(item, "__vmData__", {
                    get() {
                      return res;
                    },
                  });
                }

                obj.__fns__.forEach((fn) => fn?.call(this, item, res, index));
                return res;
              },
              name
            );
          },
        },
      };
    }

    __extend__({ attrs, fn, mixins }) {
      if (mixins) this.mixins.push(...wrapInArray(mixins));
      if (attrs && !isEmptyObject((attrs))) {
        const oldAttrs = (obj.__attrs__);
        obj.__attrs__ = {
          ...oldAttrs,
          ...(attrs),
        };
      }
      if (isFunction(fn)) obj.__fns__.push(fn);
      return this;
    }
  }

  return new CreateMixin();
}
