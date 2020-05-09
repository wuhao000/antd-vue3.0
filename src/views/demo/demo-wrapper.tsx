import {Col, Row} from '@/components/grid';
import Layout from '@/components/layout';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'DemoWrapper',
  render() {
    const left = this.$slots['left'];
    const right = this.$slots['right'];
    return <Layout>
      {this.$slots.default ? <Row>
        <Col span={24}>{this.$slots.default()}</Col>
      </Row> : null
      }
      {
        left || right ? <Row gutter={20}>
          {left ? <Col span={12}>
            {left()}
          </Col> : null}
          {right ? <Col span={12}>
            {right()}
          </Col> : null}
        </Row> : null
      }
    </Layout>;
  }
});
