<template>
  <demo-wrapper>
    <template v-slot:left>
      <basic-input-demo/>
      <input-prefix-suffix-demo/>
      <input-search-demo/>
      <button-group-demo/>
    </template>
    <template v-slot:right>
      <input-addon-demo/>
      <input-clear-demo/>
      <input-password-demo/>
    </template>
  </demo-wrapper>

</template>
<script lang="ts">
  import {Col as ACol, Row as ARow} from '@/components/grid';
  import AInput from '@/components/input';
  import InputAddonDemo from '@/views/demo/input/addon.vue';
  import BasicInputDemo from '@/views/demo/input/basic.vue';
  import ButtonGroupDemo from '@/views/demo/input/group.vue';
  import InputPasswordDemo from '@/views/demo/input/password.vue';
  import InputPrefixSuffixDemo from '@/views/demo/input/prefix-suffix.vue';
  import InputSearchDemo from '@/views/demo/input/search.vue';
  import InputClearDemo from './clear.vue';

  export default {
    components: {
      InputPasswordDemo,
      InputAddonDemo,
      ButtonGroupDemo,
      InputSearchDemo,
      InputPrefixSuffixDemo,
      BasicInputDemo,
      InputClearDemo,
      AInput,
      ARow,
      ACol
    }
  };
</script>
