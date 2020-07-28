<template>
  <a-cascader
      :options="options"
      :show-search="{ filter }"
      placeholder="Please select"
      @change="onChange"
  />
</template>
<script>
  export default {
    name: 'cascaderSearch',
    data() {
      return {
        meta: `####搜索
可以直接搜索选项并选择。`,
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
                    label: 'West Lake',
                  },
                  {
                    value: 'xiasha',
                    label: 'Xia Sha',
                    disabled: true,
                  },
                ],
              },
            ],
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
                    label: 'Zhong Hua men',
                  },
                ],
              },
            ],
          },
        ],
      };
    },
    methods: {
      onChange(value, selectedOptions) {
        console.log(value, selectedOptions);
      },
      filter(inputValue, path) {
        return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
      },
    },
  };
</script>
