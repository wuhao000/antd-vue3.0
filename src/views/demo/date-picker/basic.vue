<template>
  <code-box>
    <a-date-picker @change="onChange" />
    <br />
    <a-month-picker placeholder="Select month" @change="onChange" />
    <br />
    <a-range-picker @change="onChange" />
    <br />
    <a-week-picker placeholder="Select week" @change="onChange" />
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'DatePickerBasicDemo',
    components: { CodeBox },
    methods: {
      onChange(date, dateString) {
        console.log(date?.format("YYYY-MM-DD HH:mm:ss"));
      },
    },
  };
</script>
