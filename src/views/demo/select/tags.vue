<template>
  <code-box>
    <a-select mode="tags"
              style="width: 100%"
              placeholder="Tags Mode"
              @change="handleChange">
      <a-select-option :value="1">a</a-select-option>
      <a-select-option :value="2">b</a-select-option>
      <a-select-option :value="3">c</a-select-option>
    </a-select>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'SelectTagsDemo',
    components: { CodeBox },
    methods: {
      handleChange(value) {
        console.log(`selected ${value}`);
      },
    },
  };
</script>
