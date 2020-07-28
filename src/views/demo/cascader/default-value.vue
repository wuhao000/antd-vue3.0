<template>
  <a-cascader :options="options"
              :default-value="['zhejiang', 'hangzhou', 'xihu']"
              @change="onChange"
  />
</template>
<script>
  export default {
    name: 'cascaderDefaultValue',
    data() {
      return {
        meta: `####默认值
默认值通过数组的方式指定。`,
        options: [
          {
            value: 'zhejiang',
            label: 'Zhejiang',
            children: [
              {
                value: 'hangzhou',
                label: 'Hangzhou',
                children: [
                  {
                    value: 'xihu',
                    label: 'West Lake'
                  }
                ]
              }
            ]
          },
          {
            value: 'jiangsu',
            label: 'Jiangsu',
            children: [
              {
                value: 'nanjing',
                label: 'Nanjing',
                children: [
                  {
                    value: 'zhonghuamen',
                    label: 'Zhong Hua Men'
                  }
                ]
              }
            ]
          }
        ]
      };
    },
    methods: {
      onChange(value) {
        console.log(value);
      }
    }
  };
</script>
