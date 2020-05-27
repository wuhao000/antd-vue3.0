<template>
  <code-box>
    <a-card
        style="width:100%"
        title="Card title"
        :tab-list="tabList"
        :active-tab-key="key"
        @tabChange="key => onTabChange(key, 'key')">
      <template v-slot:customRender="item">
        <span> <a-icon type="home" />{{ item.key }} </span>
      </template>
      <template v-slot:extra>
        <a href="#">More</a>
      </template>
      {{ contentList[key] }}
    </a-card>
    <br /><br />
    <a-card
        style="width:100%"
        :tab-list="tabListNoTitle"
        :active-tab-key="noTitleKey"
        @tabChange="key => onTabChange(key, 'noTitleKey')">
      <p v-if="noTitleKey === 'article'">
        article content
      </p>
      <p v-else-if="noTitleKey === 'app'">
        app content
      </p>
      <p v-else="noTitleKey === 'project'">
        project content
      </p>
      <template v-slot:tabBarExtraContent>
        <a href="#">More</a>
      </template>
    </a-card>
  </code-box>
</template>

<script>
  import CodeBox from '../code-box';
  export default {
    name: 'CardTabDemo',
    components: { CodeBox },
    data() {
      return {
        tabList: [
          {
            key: 'tab1',
            // tab: 'tab1',
            scopedSlots: { tab: 'customRender' },
          },
          {
            key: 'tab2',
            tab: 'tab2',
          },
        ],
        contentList: {
          tab1: 'content1',
          tab2: 'content2',
        },
        tabListNoTitle: [
          {
            key: 'article',
            tab: 'article',
          },
          {
            key: 'app',
            tab: 'app',
          },
          {
            key: 'project',
            tab: 'project',
          },
        ],
        key: 'tab1',
        noTitleKey: 'app',
      };
    },
    methods: {
      onTabChange(key, type) {
        console.log(key, type);
        this[type] = key;
      },
    },
  };
</script>
