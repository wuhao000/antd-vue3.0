import {Col, Row} from '@/components/grid';
import Layout from '@/components/layout';
import {defineComponent, onMounted, ref, VNode} from 'vue';
import CodeBox from './code-box.vue';

export default defineComponent({
  name: 'DemoWrapper',
  setup(props, {slots}) {
    const wrap = (children: VNode[]) => {
      if (children) {
        return children.map(c => {
          const props: any = {};
          if (c.component) {
            const ctx = c.component['ctx'];
            if (ctx) {
              if (ctx.meta) {
                props.meta = ctx.meta;
              }
            }
          }
          if (typeof c.type === 'symbol' && c.type.description === 'Comment') {
            return c;
          }
          // @ts-ignore
          return <CodeBox {...props}>{c}</CodeBox>;
        });
      }
      return children;
    };
    const children = ref(slots.default && slots.default());
    const left = ref(slots.left && slots.left());
    const right = ref(slots.right && slots.right());
    onMounted(() => {
      children.value = wrap(children.value);
      left.value = wrap(left.value);
      right.value = wrap(right.value);
    });
    return {
      children,
      left,
      right
    };
  },
  render() {
    const {left, right, children} = this;
    return <Layout class="demo-wrapper">
      {children ? <Row>
        <Col span={24}>{children}</Col>
      </Row> : null
      }
      {
        left || right ? <Row gutter={20}>
          {left ? <Col span={12}>
            {left}
          </Col> : null}
          {right ? <Col span={12}>
            {right}
          </Col> : null}
        </Row> : null
      }
    </Layout>;
  }
});
