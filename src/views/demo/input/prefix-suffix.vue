<template>
  <div class="components-input-demo-presuffix">
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
    <br/>
    <br/>
    <a-input prefix="￥" suffix="RMB"/>
  </div>
</template>
<script>
  import CodeBox from '../code-box.vue';

  export default {
    name: 'InputPrefixSuffixDemo',
    components: { CodeBox },
    data() {
      return {
        userName: '',
        meta: `####前缀和后缀
在输入框上添加前缀或后缀图标。`
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
