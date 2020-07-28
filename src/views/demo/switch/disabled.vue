<template>
  <code-box>
    <a-switch default-checked
              :disabled="disabled"
              style="margin-bottom:5px"/>
    <br/>
    <a-button type="primary"
              @click="onToggle">
      Toggle disabled
    </a-button>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'SwitchDisabledDemo',
    components: { CodeBox },
    data() {
      return {
        disabled: true,
      };
    },
    methods: {
      onToggle() {
        this.disabled = !this.disabled;
      },
    },
  };
</script>
