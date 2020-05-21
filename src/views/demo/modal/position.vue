<template>
  <div id="components-modal-demo-position">
    <a-button type="primary" @click="() => setModal1Visible(true)">
      Display a modal dialog at 20px to Top
    </a-button>
    <a-modal
        title="20px to Top"
        style="top: 20px;"
        :visible="modal1Visible"
        @ok="() => setModal1Visible(false)"
        @cancel="() => setModal1Visible(false)">
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </a-modal>
    <br /><br />
    <a-button type="primary" @click="() => (modal2Visible = true)">
      Vertically centered modal dialog
    </a-button>
    <a-modal
        v-model:visible="modal2Visible"
        title="Vertically centered modal dialog"
        centered
        @ok="() => (modal2Visible = false)"
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </a-modal>
  </div>
</template>
<script>
  export default {
    name: 'ModalPositionDemo',
    data() {
      return {
        modal1Visible: false,
        modal2Visible: false,
      };
    },
    methods: {
      setModal1Visible(modal1Visible) {
        this.modal1Visible = modal1Visible;
      },
    },
  };
</script>
