<template>
  <code-box>
    <div>
      <a-radio-group v-model:value="value"
                     @change="onChange">
        <a-radio-button value="a">
          Hangzhou
        </a-radio-button>
        <a-radio-button value="b">
          Shanghai
        </a-radio-button>
        <a-radio-button value="c">
          Beijing
        </a-radio-button>
        <a-radio-button value="d">
          Chengdu
        </a-radio-button>
      </a-radio-group>
    </div>
    <div :style="{ marginTop : '16px' }">
      <a-radio-group default-value="a"
                     @change="onChange">
        <a-radio-button value="a">
          Hangzhou
        </a-radio-button>
        <a-radio-button value="b" disabled>
          Shanghai
        </a-radio-button>
        <a-radio-button value="c">
          Beijing
        </a-radio-button>
        <a-radio-button value="d">
          Chengdu
        </a-radio-button>
      </a-radio-group>
    </div>
    <div :style="{ marginTop : '16px' }">
      <a-radio-group disabled
                     default-value="a"
                     @change="onChange">
        <a-radio-button value="a">
          Hangzhou
        </a-radio-button>
        <a-radio-button value="b">
          Shanghai
        </a-radio-button>
        <a-radio-button value="c">
          Beijing
        </a-radio-button>
        <a-radio-button value="d">
          Chengdu
        </a-radio-button>
      </a-radio-group>
    </div>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  export default {
    name: 'RadioGroupDemo',
    components: { CodeBox },
    setup() {
      const onChange = (e) => {
        console.log(`checked = ${e.target.value}`);
      };
      return {
        value: 'a',
        onChange
      };
    }
  };
</script>
