import {useRefs} from '@/components/vc-tabs/src/save-ref';
import omit from 'omit.js';
import shallowEqual from 'shallowequal';
import {defineComponent, getCurrentInstance, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {getListenersFromInstance, getOptionProps} from '../props-util';
import proxyComponent from '../proxy-component';
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
        const {getRef, saveRef} = useRefs();
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
          return getRef('wrappedInstance');
        };
        return {
          subscribed, preProps, getWrappedInstance, store, saveRef
        };
      },
      render() {
        const instance = getCurrentInstance();
        this.preProps = {...this.$props};
        const {$slots = {}, subscribed, store} = this;
        const props = getOptionProps(instance);
        this.preProps = {...omit(props, ['__propsSymbol__'])};
        const wrapProps = {
          ...props,
          ...subscribed,
          store,
          ...getListenersFromInstance(instance)
        };
        return (
            <WrappedComponent {...wrapProps} ref={this.saveRef('wrappedInstance')}>
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
