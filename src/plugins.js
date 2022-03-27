import { isObject } from "./utils";
import { nanoid } from "nanoid";

const selectableComputed = {
  /**
   * 已选中的数据项
   * @returns {Array}
   */
  realSelectedItems({ realSelectedItemsIndex, __vmData__ }) {
    return realSelectedItemsIndex.map((index) => __vmData__[index].data);
  },
  /**
   * 已选中的数据项索引
   * @returns {Array}
   */
  realSelectedItemsIndex({ __vmData__ }) {
    return __vmData__.reduce((acc, cur, index) => {
      if (cur.selected) acc.push(index);
      return acc;
    }, []);
  },
  /**
   * 已选中的数据项数量
   * @returns {number}
   */
  selectedTotal({ realSelectedItems }) {
    return realSelectedItems.length;
  },
  /**
   * 数据项数量
   * @returns {*}
   */
  realTotal: ({ __vmData__ }) => __vmData__.length,
  /**
   * 是否已经全部选中
   * @returns {boolean}
   */
  isSelectedAll: {
    get({ selectedTotal, realTotal }) {
      return selectedTotal === realTotal && realTotal !== 0;
    },
    set(val) {
      this.__vmData__.forEach((item) => (item.selected = val));
    },
  },
  /**
   * 是否至少选中一项
   * @returns {boolean}
   */
  isIndeterminate({ selectedTotal, realTotal }) {
    return !!(selectedTotal && selectedTotal < realTotal);
  },
};

export const getSelectablePlugin = (defaultSelected = false, { needComputed = false } = {}) => ({
  attrs: {
    selected() {
      return this.defaultSelected;
    },
  },
  fn(item, res) {
    if (!isObject(item)) return;
    if (item.$selected !== undefined) res.selected = item.$selected;
    Reflect.defineProperty(item, "$selected", {
      configurable: true,
      get() {
        return res.selected;
      },
      set(val) {
        res.selected = val;
      },
    });
  },
  mixins: {
    props: {
      defaultSelected: {
        type: Boolean,
        default: defaultSelected,
      },
    },
    computed: needComputed ? selectableComputed : {},
  },
});

export const selectableMixinPlugin = getSelectablePlugin()

export const editableMixinPlugin = {
  attrs: {
    edited: false,
  },
  fn(item, res) {
    if (!isObject(item)) return;
    if (item.$edited !== undefined) res.edited = item.$edited;
    Reflect.defineProperty(item, "$edited", {
      configurable: true,
      get() {
        return res.edited;
      },
      set(val) {
        res.edited = val;
      },
    });
  },
};

export function createUuidMixinPlugin({ prefix = "", useUuid = true, itemKey = "id" } = {}) {
  prefix = prefix ? `${prefix}--` : "";
  return {
    attrs: {
      uuid: (item) => `${prefix}${useUuid ? nanoid(10) : item[itemKey] ?? nanoid()}`,
    },
    fn(item, res) {
      if (!isObject(item)) return;
      Reflect.defineProperty(item, "$uuid", {
        configurable: true,
        get() {
          return res.uuid;
        },
      });
    },
  };
}

export const uuidMixinPlugin = createUuidMixinPlugin({
  prefix: "batch-editor-item",
  useUuid: false,
});

export const dirtyMixinPlugin = {
  attrs: {
    dirty: false,
  },
  fn(item, res) {
    if (!isObject(item)) return;
    Reflect.defineProperty(item, "$dirty", {
      configurable: true,
      get() {
        return res.dirty;
      },
      set(val) {
        res.dirty = val;
      },
    });
  },
  mixins: [
    {
      computed: {
        isDirty: {
          get({ __vmData__: items }) {
            return items.some((item) => item.dirty);
          },
          set(val) {
            const res = !!val;
            if (this.isDirty === res) return;
            this.__vmData__.forEach((item) => {
              item.dirty = res;
            });
          },
        },
      },
    },
  ],
};

export const createRefsMixinPlugin = (refField = "$uuid") => ({
  fn(item) {
    if (!isObject(item)) return;
    Reflect.defineProperty(item, "$ref", {
      get: () => {
        const refName = item[refField] || item.id;
        return this.$refs[refName]?.[0];
      },
    });
  },
});

export const refsMixinPlugin = createRefsMixinPlugin();

export const validMixinPlugin = {
  attrs: {
    valid: false,
  },
  fn(item, res) {
    if (!isObject(item)) return;
    Reflect.defineProperty(item, "$valid", {
      configurable: true,
      get() {
        return res.valid;
      },
      set(val) {
        res.valid = val;
      },
    });
  },
  mixins: [
    {
      computed: {
        isAllValidation: {
          get({ __vmData__: items }) {
            return items.some((item) => item.valid);
          },
          set(val) {
            const res = !!val;
            if (this.isAllValidation === res) return;
            this.__vmData__.forEach((item) => {
              item.valid = res;
            });
          },
        },
      },
    },
  ],
};
