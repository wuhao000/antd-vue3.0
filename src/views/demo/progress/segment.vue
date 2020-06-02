<template>
  <code-box>
    <a-tooltip title="3 done / 3 in progress / 4 to do">
      <a-progress :percent="60"
                  :success-percent="30"/>
    </a-tooltip>
    <a-tooltip title="3 done / 3 in progress / 4 to do">
      <a-progress :percent="60"
                  :success-percent="30"
                  type="circle"/>
    </a-tooltip>
    <a-tooltip title="3 done / 3 in progress / 4 to do">
      <a-progress :percent="60"
                  :success-percent="30"
                  type="dashboard"/>
    </a-tooltip>
  </code-box>
</template>

<script>
  export default {
    name: 'progressSegment'
  };
</script>
