<template>
  <code-box>
    <h4 style="margin-bottom: 16px">
      Presets:
    </h4>
    <div>
      <div v-for="color in colors" :key="color">
        <a-badge :color="color" :text="color" />
      </div>
    </div>
    <h4 style="margin: 16px 0">
      Custom:
    </h4>
    <div>
      <a-badge color="#f50" text="#f50" />
      <br />
      <a-badge color="#2db7f5" text="#2db7f5" />
      <br />
      <a-badge color="#87d068" text="#87d068" />
      <br />
      <a-badge color="#108ee9" text="#108ee9" />
    </div>
  </code-box>
</template>
<script>
  const colors = [
    'pink',
    'red',
    'yellow',
    'orange',
    'cyan',
    'green',
    'blue',
    'purple',
    'geekblue',
    'magenta',
    'volcano',
    'gold',
    'lime',
  ];
  export default {
    name:'BadgeColorfulDemo',
    data() {
      return {
        colors,
      };
    },
  };
</script>
