<template>
  <code-box>
    <p>Align Top</p>
    <a-row type="flex" justify="center" align="top">
      <a-col :span="4">
        <p class="height-100">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-50">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-120">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-80">
          col-4
        </p>
      </a-col>
    </a-row>

    <p>Align Center</p>
    <a-row type="flex" justify="space-around" align="middle">
      <a-col :span="4">
        <p class="height-100">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-50">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-120">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-80">
          col-4
        </p>
      </a-col>
    </a-row>

    <p>Align Bottom</p>
    <a-row type="flex" justify="space-between" align="bottom">
      <a-col :span="4">
        <p class="height-100">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-50">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-120">
          col-4
        </p>
      </a-col>
      <a-col :span="4">
        <p class="height-80">
          col-4
        </p>
      </a-col>
    </a-row>
  </code-box>
</template>
<style>
  .grid-demo .code-box-demo .height-100, [id^=components-grid-demo-] .code-box-demo .height-100 {
    height: 100px;
    line-height: 100px;
  }
</style>
