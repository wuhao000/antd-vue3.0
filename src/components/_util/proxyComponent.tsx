import {getOptionProps} from './props-util';
import PropTypes from './vue-types';
import { defineComponent } from 'vue';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.name || 'Component';
}

export default function wrapWithConnect(WrappedComponent) {
  const tempProps = WrappedComponent.props || {};
  const methods = WrappedComponent.methods || {};
  const props = {};
  Object.keys(tempProps).forEach(k => {
    props[k] = {...tempProps[k], required: false};
  });
  WrappedComponent.props.__propsSymbol__ = PropTypes.any;
  WrappedComponent.props.children = PropTypes.array.def([]);
  const ProxyWrappedComponent = defineComponent({
    props,
    model: WrappedComponent.model,
    name: `Proxy_${getDisplayName(WrappedComponent)}`,
    methods: {
      getProxyWrappedInstance() {
        return this.$refs.wrappedInstance;
      }
    },
    render() {
      const {$slots = {}} = this;
      const props = getOptionProps(this);
      const wrapProps: any = {
        ...props,
        ...this.$attrs,
        __propsSymbol__: Symbol(),
        componentWillReceiveProps: {...props},
        children: $slots.default || props.children || []
      };
      if (Object.keys($slots).length) {
        wrapProps.slots = $slots;
      }
      const slotsKey = Object.keys($slots);
      return (
          <WrappedComponent {...wrapProps} ref="wrappedInstance">
            {slotsKey.length
                ? slotsKey.map(name => {
                  return <template slot={name}>{$slots[name]}</template>;
                })
                : null}
          </WrappedComponent>
      );
    }
  });
  Object.keys(methods).map(m => {
    ProxyWrappedComponent.methods[m] = function() {
      return this.getProxyWrappedInstance()[m](...arguments);
    };
  });
  return ProxyWrappedComponent;
}
