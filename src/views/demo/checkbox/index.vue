<template>
  <demo-wrapper>
    <template v-slot:left>
      <checkbox-basic-demo/>
      <disabled-demo/>
      <check-box-group-demo/>
    </template>
    <template v-slot:right>
      <select-all-demo/>
    </template>
  </demo-wrapper>
</template>
<script lang="ts">
  import CheckboxBasicDemo from '@/views/demo/checkbox/basic.vue';
  import CheckBoxGroupDemo from '@/views/demo/checkbox/group.vue';
  import SelectAllDemo from '@/views/demo/checkbox/select-all.vue';
  import DisabledDemo from './disabled.vue';

  export default {
    components: {SelectAllDemo, CheckBoxGroupDemo, CheckboxBasicDemo, DisabledDemo}
  };
</script>
