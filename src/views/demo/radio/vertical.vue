<template>
  <code-box>
    <a-radio-group v-model="value"
                   @change="onChange">
      <a-radio :style="radioStyle"
               :value="1">
        Option A
      </a-radio>
      <a-radio :style="radioStyle"
               :value="2">
        Option B
      </a-radio>
      <a-radio :style="radioStyle"
               :value="3">
        Option C
      </a-radio>
      <a-radio :style="radioStyle"
               :value="4">
        More...
        <a-input v-if="value === 4"
                 :style="{ width : 100, marginLeft : 10 }"/>
      </a-radio>
    </a-radio-group>
  </code-box>
</template>
<script lang="ts">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'VerticalRadioGroupDemo',
    components: {CodeBox},
    setup() {
      const onChange = (e) => {
        console.log('radio checked', e.target.value);
      };
      return {
        value: 1,
        onChange,
        radioStyle: {
          display: 'block',
          height: '30px',
          lineHeight: '30px'
        }
      };
    }
  };
</script>
