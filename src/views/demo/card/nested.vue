<template>
  <code-box>
    <a-card title="Card title">
      <p style="fontSize: 14px;color: rgba(0, 0, 0, 0.85); marginBottom: 16px;fontWeight: 500">
        Group title
      </p>
      <a-card title="Inner card title">
        <template v-slot:extra>
          <a href="#">More</a>
        </template>
        Inner Card content
      </a-card>
      <a-card title="Inner card title"
              :style="{ marginTop : '16px' }">
        <template v-slot:extra>
          <a href="#">More
          </a>
        </template>
        Inner Card content
      </a-card>
    </a-card>
  </code-box>
</template>
<script lang="ts">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'CardNestedDemo',
    components: {CodeBox}
  };
</script>
