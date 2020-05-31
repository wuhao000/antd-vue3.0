import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {useLocalValue} from '@/tools/value';
import omit from 'omit.js';
import {defineComponent} from 'vue';
import {getComponentFromContext, mergeProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import Button from '../button';
import buttonTypes from '../button/buttonTypes';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import defaultLocale from '../locale-provider/default';
import LocaleReceiver from '../locale-provider/locale-receiver';
import Tooltip from '../tooltip';
import abstractTooltipProps from '../tooltip/abstract-tooltip-props';

const tooltipProps = abstractTooltipProps();
const btnProps = buttonTypes();
const Popconfirm = defineComponent({
  name: 'APopconfirm',
  props: {
    ...tooltipProps,
    prefixCls: PropTypes.string,
    transitionName: PropTypes.string.def('zoom-big'),
    content: PropTypes.any,
    title: PropTypes.any,
    trigger: tooltipProps.trigger.def('click'),
    okType: btnProps.type.def('primary'),
    disabled: PropTypes.bool.def(false),
    okText: PropTypes.any,
    cancelText: PropTypes.any,
    icon: PropTypes.any,
    okButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object
  },
  setup($props, {emit, slots: $slots}) {
    const {value: sVisible, setValue: setLocalVisible} = useLocalValue($props.defaultVisible, 'visible');
    const onConfirm = (e) => {
      setVisible(false, e);
      emit('confirm', e);
    };
    const onCancel = (e) => {
      setVisible(false, e);
      emit('cancel', e);
    };
    const onVisibleChange = (visible) => {
      const {disabled} = $props;
      if (disabled) {
        return;
      }
      setVisible(visible);
    };
    const setVisible = (visible, e?) => {
      setLocalVisible(visible);
      emit('visibleChange', visible, e);
    };
    const {saveRef, getRef} = useRefs();
    const getPopupDomNode = () => {
      return getRef('tooltip').getPopupDomNode();
    };
    const renderOverlay = (prefixCls, popconfirmLocale) => {
      const {okType, okButtonProps, cancelButtonProps} = $props;
      const icon = getComponentFromContext({
        $slots,
        $props
      }, 'icon') || (
          <Icon type="exclamation-circle" theme="filled"/>
      );
      const cancelBtnProps = mergeProps(
          {
            size: 'small',
            onClick: onCancel
          },
          cancelButtonProps
      );
      const okBtnProps = mergeProps(
          {
            type: okType,
            size: 'small',
            onClick: onConfirm
          },
          okButtonProps
      );
      return (
          <div class={`${prefixCls}-inner-content`}>
            <div class={`${prefixCls}-message`}>
              {icon}
              <div class={`${prefixCls}-message-title`}>{getComponentFromContext({
                $props, $slots
              }, 'title')}</div>
            </div>
            <div class={`${prefixCls}-buttons`}>
              <Button {...cancelBtnProps}>
                {getComponentFromContext({$slots, $props}, 'cancelText') || popconfirmLocale.cancelText}
              </Button>
              <Button {...okBtnProps}>
                {getComponentFromContext({$slots, $props}, 'okText') || popconfirmLocale.okText}
              </Button>
            </div>
          </div>
      );
    };
    return {
      onConfirm,
      onCancel,
      onVisibleChange,
      setVisible,
      getPopupDomNode,
      renderOverlay,
      sVisible,
      saveRef,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const {prefixCls: customizePrefixCls} = ctx;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('popover', customizePrefixCls);
    const otherProps = omit(ctx.$props, ['title', 'content', 'cancelText', 'okText']);
    const tooltipProps = {
      ...otherProps,
      prefixCls,
      visible: this.sVisible,
      ref: this.saveRef('tooltip'),
      onVisibleChange: this.onVisibleChange
    };
    const overlay = (
        <LocaleReceiver
            componentName="Popconfirm"
            defaultLocale={defaultLocale.Popconfirm}
            slots={{
              default: popconfirmLocale => this.renderOverlay(prefixCls, popconfirmLocale)
            }}
        />
    );
    return (
        <Tooltip {...tooltipProps}
                 slots={{
                   title: overlay,
                   default: this.$slots.default
                 }}/>
    );
  }
}) as any;

/* istanbul ignore next */
Popconfirm.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Popconfirm.name, Popconfirm);
};

export default Popconfirm;
