import {reactive} from 'vue';

export const useRefs = () => {
  const refs = reactive({});
  return {
    getRef(name) {
      return refs[name];
    },
    saveRef(name) {
      return node => {
        if (node) {
          refs[name] = node;
        }
      };
    }
  };
};
