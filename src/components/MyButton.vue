<template>
  <div>
    {{count}}
  </div>
  <button @click="onClick(count, $event)">{{title}}</button>
</template>
<script lang="tsx">
  import {ref} from 'vue';

  export default {
    props: {
      onClick: Function,
      title: String
    },
    setup(props: { title: string, onClick: () => any }) {
      const count = ref(0);
      return {...props, count};
    }
  };
</script>
