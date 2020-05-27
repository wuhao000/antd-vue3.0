<template>
  <code-box>
    <a-card hoverable
            style="width: 240px">
      <template v-slot:cover>
        <img alt="example"
             src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
        />
      </template>
      <a-card-meta title="Europe Street beat">
        <template v-slot:description>
          www.instagram.com
        </template>
      </a-card-meta>
    </a-card>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'CardContentDemo',
    components: { CodeBox }
  }
</script>
