<template>
  <code-box>
    <a-switch checked-children="开"
              un-checked-children="关" default-checked/>
    <br/>
    <a-switch checked-children="1"
              un-checked-children="0"/>
    <br/>
    <a-switch default-checked>
      <template v-slot:checkedChildren>
        <a-icon slot="checkedChildren"
                type="check"/>
      </template>
      <template v-slot:unCheckedChildren>
        <a-icon slot="unCheckedChildren"
                type="close"/>
      </template>
    </a-switch>
  </code-box>
</template>
<script>
  export default {
    name: 'IconSwitchDemo'
  }
</script>
