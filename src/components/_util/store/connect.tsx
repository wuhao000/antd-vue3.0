import omit from 'omit.js';
import shallowEqual from 'shallowequal';
import {defineComponent, inject, ref, watch, onMounted, onBeforeUnmount, getCurrentInstance} from 'vue';
import {getListeners, getOptionProps} from '../props-util';
import proxyComponent from '../proxyComponent';
import PropTypes from '../vue-types';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.name || 'Component';
}

const defaultMapStateToProps = () => ({});
export default function connect(mapStateToProps) {
  const shouldSubscribe = !!mapStateToProps;
  const finnalMapStateToProps = mapStateToProps || defaultMapStateToProps;
  return function wrapWithConnect(WrappedComponent) {
    const tempProps = omit(WrappedComponent.props || {}, ['store']);
    const props = {
      __propsSymbol__: PropTypes.any
    };
    Object.keys(tempProps).forEach(k => {
      props[k] = {...tempProps[k], required: false};
    });
    const Connect = defineComponent({
      name: `Connect_${getDisplayName(WrappedComponent)}`,
      props,
      setup(props) {
        const instance = getCurrentInstance();
        const storeContext: any = inject('storeContext') || {};
        const store = ref(storeContext.store);
        const preProps = omit(getOptionProps(instance), ['__propsSymbol__']);
        const subscribed = ref(finnalMapStateToProps(storeContext.store.getState(), props));
        const unsubscribe = ref(null);
        watch(() => props.__propsSymbol__, () => {
          if (mapStateToProps && mapStateToProps.length === 2) {
            subscribed.value = finnalMapStateToProps(storeContext.store.getState(), props);
          }
        });
        onMounted(() => {
          trySubscribe();
        });
        onBeforeUnmount(() => {
          tryUnsubscribe();
        });
        const handleChange = () => {
          if (!unsubscribe.value) {
            return;
          }
          const props = omit(getOptionProps(instance), ['__propsSymbol__']);
          const nextSubscribed = finnalMapStateToProps(props.store.getState(), props);
          if (
              !shallowEqual(preProps.value, props) ||
              !shallowEqual(subscribed.value, nextSubscribed)
          ) {
            subscribed.value = nextSubscribed;
          }
        };

        const trySubscribe = () => {
          if (shouldSubscribe) {
            unsubscribe.value = store.subscribe(handleChange);
            handleChange();
          }
        };

        const tryUnsubscribe = () => {
          if (unsubscribe.value) {
            unsubscribe.value();
            unsubscribe.value = null;
          }
        };
        const getWrappedInstance = () => {
          return this.$refs.wrappedInstance;
        };
        return {
          subscribed, preProps
        };
      },
      render() {
        this.preProps = {...this.$props};
        const {$slots = {}, subscribed, store} = this;
        const props = getOptionProps(this);
        this.preProps = {...omit(props, ['__propsSymbol__'])};
        const wrapProps = {
          ...props,
          ...subscribed,
          store,
          ...getListeners(this.$attrs)
        };
        return (
            <WrappedComponent {...wrapProps} ref="wrappedInstance">
              {Object.keys($slots).map(name => {
                return <template slot={name}>{$slots[name]}</template>;
              })}
            </WrappedComponent>
        );
      }
    });
    return proxyComponent(Connect);
  };
}
