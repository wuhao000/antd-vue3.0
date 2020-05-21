<template>
  <code-box>
    <a-date-picker placeholder="请选择" @change="onChange"/>
    <br/>
    <a-month-picker placeholder="选择月"
                    @change="onChange"/>
    <br/>
    <a-range-picker @change="onChange"/>
    <br/>
    <a-week-picker placeholder="选择周"
                   @change="onChange"/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'DatePickerBasicDemo',
    components: { CodeBox },
    setup() {
      return {
        onChange(date, dateString) {
          if (date) {
            if (Array.isArray(date)) {
              console.log(date.map(it => it.format('YYYY-MM-DD HH:mm:ss'))
                  .join(','));
            } else {
              console.log(date.format('YYYY-MM-DD HH:mm:ss'));
            }
          }
        }
      };
    }
  };
</script>
