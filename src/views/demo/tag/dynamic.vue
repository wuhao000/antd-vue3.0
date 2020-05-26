<template>
  <code-box>
    <template v-for="(tag, index) in tags">
      <a-tooltip v-if="tag.length > 20" :key="tag" :title="tag">
        <a-tag :key="tag" :closable="index !== 0" @close="() => handleClose(tag)">
          {{ `${tag.slice(0, 20)}...` }}
        </a-tag>
      </a-tooltip>
      <a-tag v-else :key="tag" :closable="index !== 0" @close="() => handleClose(tag)">
        {{ tag }}
      </a-tag>
    </template>
    <a-input
        v-if="inputVisible"
        :ref="setInputRef"
        type="text"
        size="small"
        :style="{ width: '78px' }"
        :value="inputValue"
        @change="handleInputChange"
        @blur="handleInputConfirm"
        @keyup.enter="handleInputConfirm"/>
    <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
      <a-icon type="plus"/>
      New Tag
    </a-tag>
  </code-box>
</template>
<script lang="ts">
  import {nextTick, ref} from 'vue';

  export default {
    name: 'TagDynamicDemo',
    setup(props) {
      const tags = ref(['Unremovable', 'Tag 2', 'Tag 3Tag 3Tag 3Tag 3Tag 3Tag 3Tag 3']);
      const inputValue = ref('');
      const inputRef = ref(undefined);
      const inputVisible = ref(false);
      return {
        tags, inputVisible, inputValue,
        setInputRef: (el) => {
          inputRef.value = el;
        },
        handleClose(removedTag) {
          console.log(removedTag);
        },
        showInput() {
          inputVisible.value = true;
          nextTick(() => {
            console.log(1);
            inputRef.value.focus();
          });
        },

        handleInputChange(e) {
          inputValue.value = e.target.value;
        },

        handleInputConfirm() {
          const tmpInputValue = inputValue.value;
          let tmpTags = tags.value;
          if (tmpInputValue && tmpTags.indexOf(tmpInputValue) === -1) {
            tmpTags = [...tmpTags, tmpInputValue];
          }
          tags.value = tmpTags;
          inputVisible.value = false;
          inputValue.value = '';
        }
      };
    }
  };
</script>
