<template>
  <code-box>
    <a-button type="primary"
              @click="showModal">
      Open Modal with customized footer
    </a-button>
    <a-modal v-model:visible="visible"
             title="Title"
             @ok="handleOk">
      <template v-slot:footer>
        <a-button key="back"
                  @click="handleCancel">
          Return
        </a-button>
        <a-button key="submit"
                  type="primary"
                  :loading="loading"
                  @click="handleOk">
          Submit
        </a-button>
      </template>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </a-modal>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'ModalFooterDemo',
    components: { CodeBox },
    data() {
      return {
        loading: false,
        visible: false,
      };
    },
    methods: {
      showModal() {
        this.visible = true;
      },
      handleOk(e) {
        this.loading = true;
        setTimeout(() => {
          this.visible = false;
          this.loading = false;
        }, 3000);
      },
      handleCancel(e) {
        this.visible = false;
      },
    },
  };
</script>
