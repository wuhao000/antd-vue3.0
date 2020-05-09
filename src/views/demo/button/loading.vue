<template>
  <code-box :meta="meta">
    <a-button type="primary" loading>
      Loading
    </a-button>
    <a-button type="primary" size="small" loading>
      Loading
    </a-button>
    <br/>
    <a-button type="primary" :loading="loading" @mouseenter="enterLoading">
      mouseenter me!
    </a-button>
    <a-button type="primary" icon="poweroff"
              :loading="iconLoading" @click="enterIconLoading">
      延迟1s
    </a-button>
    <br/>
    <a-button type="primary" loading/>
    <a-button type="primary" shape="circle" loading/>
    <a-button type="danger" shape="round" loading/>
  </code-box>
</template>
<script lang="tsx">
  import AButton from '@/components/button';
  import {ref, Ref} from 'vue';
  import CodeBox from '../code-box.vue';

  export default {
    name: 'ButtonLoadingDemo',
    components: {CodeBox, AButton},
    data() {
      return {
        loading: false,
        iconLoading: false
      };
    },
    setup() {
      const loading = ref(false);
      const enterLoading = () => {
        loading.value = true;
      };
      const iconLoading: Ref<boolean | object> = ref(false);
      const enterIconLoading = () => {
        iconLoading.value = {delay: 1000};
      };
      return {
        enterLoading,
        enterIconLoading,
        loading,
        iconLoading,
        meta: `#### 加载中状态
添加 loading 属性即可让按钮处于加载状态，最后两个按钮演示点击后进入加载状态。`
      };
    },
    methods: {}
  };
</script>
