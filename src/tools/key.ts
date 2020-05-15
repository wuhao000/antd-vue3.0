import { getCurrentInstance } from 'vue';

export const useKey = () => {
  return getCurrentInstance().vnode.key?.toString();
};
