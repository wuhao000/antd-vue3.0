<template>
  <div>
    <a-tooltip placement="top" title="top">
      <a-button class="aaaa" @click="()=>{}">top</a-button>
    </a-tooltip>
    <a-tooltip placement="bottom" title="bottom">
      <a-button class="aaaa" @click="()=>{}">bottom</a-button>
    </a-tooltip>
    <a-tooltip placement="left" title="left">
      <a-button class="aaaa" @click="()=>{}">left</a-button>
    </a-tooltip>
    <a-tooltip placement="right" title="right">
      <a-button class="aaaa" @click="()=>{}">right</a-button>
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
