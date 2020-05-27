import { nextTick } from 'vue';

export default {
  methods: {
    setState(state, callback) {
      Object.assign(this.$data, state);
      nextTick(() => {
        callback && callback();
      });
    }
  }
};
