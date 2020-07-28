<template>
  <code-box>
    <a-progress type="circle"
                :percent="percent"/>
    <a-button-group>
      <a-button icon="minus"
                @click="decline"/>
      <a-button icon="plus"
                @click="increase"/>
    </a-button-group>
  </code-box>
</template>
<script>
  export default {
    name: 'progressDynamic',
    data() {
      return {
        percent: 0
      };
    },
    methods: {
      increase() {
        let percent = this.percent + 10;
        if (percent > 100) {
          percent = 100;
        }
        this.percent = percent;
      },
      decline() {
        let percent = this.percent - 10;
        if (percent < 0) {
          percent = 0;
        }
        this.percent = percent;
      }
    }
  };
</script>
