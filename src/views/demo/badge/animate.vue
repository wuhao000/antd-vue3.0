<template>
  <code-box>
    <div>
      <a-badge :count="count">
        <a href="#"
           class="head-example"/>
      </a-badge>
      <a-button-group>
        <a-button @click="decline">
          <a-icon type="minus"/>
        </a-button>
        <a-button @click="increase">
          <a-icon type="plus"/>
        </a-button>
      </a-button-group>
    </div>
    <div style="margin-top: 10px">
      <a-badge :dot="show">
        <a href="#"
           class="head-example"/>
      </a-badge>
      <a-switch v-model:value="show"/>
    </div>
  </code-box>
</template>
<script>
  export default {
    name: 'BadgeAnimateDemo',
    data() {
      return {
        count: 5,
        show: true
      };
    },
    methods: {
      decline() {
        let count = this.count - 1;
        if (count < 0) {
          count = 0;
        }
        this.count = count;
      },
      increase() {
        this.count++;
      }
    }
  };
</script>
