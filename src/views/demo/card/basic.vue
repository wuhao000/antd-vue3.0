<template>
  <code-box meta="####典型卡片
包含标题、内容、操作区域。
可通过设置size为default或者small，控制尺寸">
    <a-card title="Default size card" style="width: 300px">
      <template v-slot:extra>
        <a href="#">more</a>
      </template>
      <p>card content</p>
      <p>card content</p>
      <p>card content</p>
    </a-card>
    <br />
    <a-card size="small" title="Small size card" style="width: 300px">
      <template v-slot:extra>
        <a href="#">more</a>
      </template>
      <p>card content</p>
      <p>card content</p>
      <p>card content</p>
    </a-card>
  </code-box>
</template>
