<template>
  <code-box>
    <a-card :loading="loading" title="Card title">
      whatever content
    </a-card>
    <a-button style="marginTop: 16px" @click="handleClick">
      Toggle loading
    </a-button>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'CardLoadingDemo',
    components: { CodeBox },
    data() {
      return {
        loading: true,
      };
    },
    methods: {
      handleClick() {
        this.loading = !this.loading;
      },
    },
  };
</script>
