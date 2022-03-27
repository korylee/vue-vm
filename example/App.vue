<script>
// import { createVmMixin } from "../src/create";
// import { refsMixinPlugin, selectableMixinPlugin } from "../src/plugins";

export default {
  name: "App",
  // mixins: [createVmMixin("items").__extend__(selectableMixinPlugin).__extend__(refsMixinPlugin)],
  data: () => ({
    items: Array.from({ length: 100 }, (v, k) => ({ id: k, value: k })),
  }),
  mounted() {
    console.log(this.__vmData__);
  },
  methods: {
    getItemRef(item) {
      console.log(item.$ref);
    },
  },
};
</script>

<template>
  <div>
    <!-- <div>seltected ids :{{ realSelectedItems.map((item) => item.id) }}</div> -->
    <!-- <div><input v-model="isSelectedAll" type="checkbox" />全选</div> -->
    <ul>
      <li v-for="item in items" :key="item.id">
        <input v-model="item.$selected" type="checkbox" />
        {{ item.id }}: {{ item.value }}
        <button @click="getItemRef(item)">get ref</button>
      </li>
    </ul>
  </div>
</template>
