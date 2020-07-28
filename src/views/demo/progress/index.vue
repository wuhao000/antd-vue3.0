<template>
  <demo-wrapper>
    <template v-slot:left>
      <progress-basic/>
      <progress-small/>
      <progress-dynamic/>
      <progress-line-dynamic/>
      <progress-segment/>
      <progress-grandient/>
    </template>
    <template v-slot:right>
      <progress-circle/>
      <progress-small-circle/>
      <progress-text/>
      <progress-dashboard/>
      <progress-corner/>
    </template>
  </demo-wrapper>
</template>
<script lang="ts">
  import ProgressCircle from '@/views/demo/progress/circle.vue';
  import ProgressCorner from '@/views/demo/progress/corner.vue';
  import ProgressDashboard from '@/views/demo/progress/dashboard.vue';
  import ProgressGrandient from '@/views/demo/progress/grandient.vue';
  import ProgressLineDynamic from '@/views/demo/progress/line-dynamic.vue';
  import ProgressSegment from '@/views/demo/progress/segment.vue';
  import ProgressSmallCircle from '@/views/demo/progress/small-circle.vue';
  import ProgressText from '@/views/demo/progress/text.vue';
  import ProgressDynamic from './circle-dynamic.vue';
  import ProgressBasic from './basic.vue';
  import ProgressSmall from './small.vue';
  export default {
    components: {
      ProgressCorner,
      ProgressDashboard,
      ProgressText,
      ProgressSmallCircle,
      ProgressCircle,
      ProgressGrandient, ProgressSegment, ProgressLineDynamic, ProgressDynamic, ProgressBasic, ProgressSmall }
  };
</script>
