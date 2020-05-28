import a from 'b';
import c from 'd';
const d = () => {
};

const a = {
  name: 'Ab',
  data() {
    return {};
  },
  beforeCreate() {
    console.log()
  },
  mounted() {
    console.log('mounted');
  },
  created() {
    console.log('created');
  },
  beforeDestroy()    {
  },
  updated() {
  },
  methods: {
    a() {
      this.b();
      this.$emit('a', 'a');
      const props = this.$props;
    },
    b: () => {

    },
    c: function() {

    },
    d
  },
  render(h) {

  }
};
