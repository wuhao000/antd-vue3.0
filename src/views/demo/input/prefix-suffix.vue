<template>
  <code-box class="components-input-demo-presuffix">
    <a-input placeholder="Basic usage" v-model:value="userName" ref="userNameInput">
      <template v-slot:prefix>
        <a-icon type="user"/>
      </template>
      <template v-slot:suffix>
        <a-tooltip title="Extra information">
          <a-icon type="info-circle" style="color: rgba(0,0,0,.45)"/>
        </a-tooltip>
      </template>
    </a-input>
    <a-input prefix="￥" suffix="RMB"/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box.vue';

  export default {
    name: 'InputPrefixSuffixDemo',
    components: { CodeBox },
    data() {
      return {
        userName: ''
      };
    },
    methods: {
      emitEmpty() {
        this.$refs.userNameInput.focus();
        this.userName = '';
      }
    }
  };
</script>
