<template>
  <div>
    <a-tooltip placement="top" title="top">
      <a-button @click="()=>{}">top</a-button>
    </a-tooltip>
    <a-tooltip placement="bottom" title="bottom">
      <a-button @click="()=>{}">bottom</a-button>
    </a-tooltip>
    <a-tooltip placement="left" title="left">
      <a-button @click="()=>{}">left</a-button>
    </a-tooltip>
    <a-tooltip placement="right" title="right">
      <a-button @click="()=>{}">right</a-button>
    </a-tooltip>
  </div>
</template>
<script lang="ts">
  import ATooltip from '@/components/tooltip';

  export default {
    components: {
      ATooltip
    }
  };
</script>
