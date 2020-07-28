<template>
  <code-box>
    <a-select mode="tags"
              style="width: 100%"
              placeholder="Tags Mode"
              @change="handleChange">
      <a-select-option v-for="i in 25"
                       :value="(i + 9).toString(36) + i">
        {{ (i + 9).toString(36) + i }}
      </a-select-option>
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
