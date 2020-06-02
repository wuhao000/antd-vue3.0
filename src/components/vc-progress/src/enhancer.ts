import {getCurrentInstance, onUpdated, ref} from 'vue';

export const useEnhancer = () => {
  const instance = getCurrentInstance();
  const prevTimeStamp = ref(null);
  onUpdated(() => {
    const now = Date.now();
    const paths = instance['ctx'].paths;
    let updated = false;
    Object.keys(paths).forEach(key => {
      const path = paths[key];
      if (!path) {
        return;
      }
      updated = true;
      const pathStyle = path.style;
      pathStyle.transitionDuration = '.3s, .3s, .3s, .06s';

      if (prevTimeStamp.value && now - prevTimeStamp.value < 100) {
        pathStyle.transitionDuration = '0s, 0s';
      }
    });
    if (updated) {
      prevTimeStamp.value = Date.now();
    }
  });
};
