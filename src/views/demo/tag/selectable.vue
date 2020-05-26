<template>
  <code-box>
    <a-checkable-tag v-model:checked="checked1" @change="handleChange">
      Tag1
    </a-checkable-tag>
    <a-checkable-tag v-model:checked="checked2" @change="handleChange">
      Tag2
    </a-checkable-tag>
    <a-checkable-tag v-model:checked="checked3" @change="handleChange">
      Tag3
    </a-checkable-tag>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'TagSelectableDemo',
    components: { CodeBox },
    data() {
      return {
        checked1: false,
        checked2: false,
        checked3: false,
      };
    },
    methods: {
      handleChange(checked) {
        console.log(checked);
      },
    },
  };
</script>
