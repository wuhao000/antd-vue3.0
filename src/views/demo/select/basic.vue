<template>
  <code-box>
    <a-select default-value="lucy"
              style="width: 120px"
              @change="handleChange">
      <a-select-option value="jack">
        Jack
      </a-select-option>
      <a-select-option value="lucy">
        Lucy
      </a-select-option>
      <a-select-option value="disabled" disabled>
        Disabled
      </a-select-option>
      <a-select-option value="Yiminghe">
        yiminghe
      </a-select-option>
    </a-select>
    <a-select default-value="lucy"
              style="width: 120px" disabled>
      <a-select-option value="lucy">
        Lucy
      </a-select-option>
    </a-select>
    <a-select default-value="lucy"
              style="width: 120px" loading>
      <a-select-option value="lucy">
        Lucy
      </a-select-option>
    </a-select>
  </code-box>
</template>
<script lang="tsx" type="text/javascript">
  import CodeBox from '../code-box';
  export default {
    name: 'SelectBasicDemo',
    components: { CodeBox },
    setup() {
      return {
        handleChange: (value) => {
          console.log('select value changed: ' + value);
        }
      };
    }
  };
</script>
