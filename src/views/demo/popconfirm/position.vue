<template>
  <code-box id="components-a-popconfirm-demo-placement">
    <div :style="{ marginLeft : `${buttonWidth}px`, whiteSpace : 'nowrap' }">
      <a-popconfirm placement="topLeft"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>TL</a-button>
      </a-popconfirm>
      <a-popconfirm placement="top"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>Top</a-button>
      </a-popconfirm>
      <a-popconfirm placement="topRight"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>TR</a-button>
      </a-popconfirm>
    </div>
    <div :style="{ width : `${buttonWidth}px`, float : 'left' }">
      <a-popconfirm placement="leftTop"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>LT</a-button>
      </a-popconfirm>
      <a-popconfirm placement="left"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>Left</a-button>
      </a-popconfirm>
      <a-popconfirm placement="leftBottom"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>LB</a-button>
      </a-popconfirm>
    </div>
    <div :style="{ width : `${buttonWidth}px`, marginLeft : `${buttonWidth * 4 + 24}px` }">
      <a-popconfirm placement="rightTop"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>RT</a-button>
      </a-popconfirm>
      <a-popconfirm placement="right"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>Right</a-button>
      </a-popconfirm>
      <a-popconfirm placement="rightBottom"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>RB</a-button>
      </a-popconfirm>
    </div>
    <div :style="{ marginLeft : `${buttonWidth}px`, clear : 'both', whiteSpace : 'nowrap' }">
      <a-popconfirm placement="bottomLeft"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>BL</a-button>
      </a-popconfirm>
      <a-popconfirm placement="bottom"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>Bottom</a-button>
      </a-popconfirm>
      <a-popconfirm placement="bottomRight"
                    ok-text="Yes"
                    cancel-text="No"
                    @confirm="confirm">
        <template v-slot:title>
          <p>{{ text }}</p>
          <p>{{ text }}</p>
        </template>
        <a-button>BR</a-button>
      </a-popconfirm>
    </div>
  </code-box>
</template>
<script>
  export default {
    name: 'PopconfirmPositionDemo',
    data() {
      return {
        buttonWidth: 70,
        text: 'Are you sure to delete this task?',
      };
    },
    methods: {
      confirm() {
        console.log('confirm');
      },
    },
  };
</script>
<style scoped>
  #components-a-popconfirm-demo-placement .ant-btn {
    width: 70px;
    text-align: center;
    padding: 0;
    margin-right: 8px;
    margin-bottom: 8px;
  }
</style>
