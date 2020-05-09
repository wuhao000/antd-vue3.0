import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  VNode,
  watch
} from 'vue';
import {filterEmpty} from '../_util/props-util';
import Wave from '../_util/wave';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import Icon from '../icon';
import buttonTypes, {ButtonProps} from './buttonTypes';

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
const component: any = defineComponent({
  name: 'AButton',
  inheritAttrs: false,
  __ANT_BUTTON: true,
  props: buttonTypes,
  setup(props: ButtonProps, {slots, emit, attrs}) {
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const hasTwoCNChar = ref(false);
    const loading = ref(props.loading);
    //     sLoading,
    const classes = computed(() => {
      const {
        prefixCls: customizePrefixCls,
        type,
        shape,
        size,
        ghost,
        block,
        icon
      } = props;
      const getPrefixCls = configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('btn', customizePrefixCls);
      const autoInsertSpace = configProvider.autoInsertSpaceInButton !== false;

      // large => lg
      // small => sm
      let sizeCls = '';
      switch (size) {
        case 'large':
          sizeCls = 'lg';
          break;
        case 'small':
          sizeCls = 'sm';
          break;
        default:
          break;
      }
      const iconType = loading.value ? 'loading' : icon;
      const children = filterEmpty(slots.default);
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-${type}`]: type,
        [`${prefixCls}-${shape}`]: shape,
        [`${prefixCls}-${sizeCls}`]: sizeCls,
        [`${prefixCls}-icon-only`]: children.length === 0 && iconType,
        [`${prefixCls}-loading`]: loading.value,
        [`${prefixCls}-background-ghost`]: ghost || type === 'ghost',
        [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar.value && autoInsertSpace,
        [`${prefixCls}-block`]: block
      };
    });
    let delayTimeout = null;
    watch(() => props.loading, (val: any, preVal) => {
      if (preVal && typeof preVal !== 'boolean' && delayTimeout) {
        clearTimeout(delayTimeout);
      }
      if (val && typeof val !== 'boolean' && val.delay) {
        delayTimeout = setTimeout(() => {
          loading.value = !!val;
        }, val.delay);
      } else {
        loading.value = !!val;
      }
    });
    onMounted(() => {
      fixTwoCNChar();
    });

    const instance = getCurrentInstance();
    const fixTwoCNChar = () => {
      // Fix for HOC usage like <FormatMessage />
      const node: any = instance.refs.buttonNode;
      if (!node) {
        return;
      }
      const buttonText = node.textContent;
      if (isNeedInserted() && isTwoCNChar(buttonText)) {
        if (!hasTwoCNChar.value) {
          hasTwoCNChar.value = true;
        }
      } else if (hasTwoCNChar.value) {
        hasTwoCNChar.value = false;
      }
    };
    onUpdated(() => {
      fixTwoCNChar();
    });
    onBeforeUnmount(() => {
      if (delayTimeout) {
        clearTimeout(delayTimeout);
      }
    });
    const isNeedInserted = () => {
      const {icon, type} = props;
      return slots.default && slots.default().length === 1 && !icon && type !== 'link';
    };
    const handleClick = (event) => {
      if (loading.value) {
        return;
      }
      emit('click', event);
    };
    const insertSpace = (child: VNode, needInserted: boolean) => {
      const SPACE = needInserted ? ' ' : '';
      if (typeof child.children === 'string') {
        let text = child.children.trim();
        if (isTwoCNChar(text)) {
          text = text.split('').join(SPACE);
        }
        return <span>{text}</span>;
      }
      return child;
    };
    return {
      insertSpace, loading, isNeedInserted,
      configProvider, classes, handleClick
    };
  },
  render() {
    const {type, isNeedInserted, configProvider, htmlType, classes, icon, disabled, handleClick, $slots, $attrs} = this;
    const buttonProps = {
      ...$attrs,
      disabled,
      class: Object.assign(classes, {
        [$attrs.class]: true
      }),
      onClick: handleClick
    };
    const iconType = this.loading ? 'loading' : icon;
    const iconNode: VNode | null = iconType ? <Icon type={iconType}/> : null;
    const children = filterEmpty($slots.default);
    const autoInsertSpace = configProvider.autoInsertSpaceInButton !== false;
    const kids: VNode[] = children.map(child =>
        this.insertSpace(child, isNeedInserted() && autoInsertSpace)
    );

    if ($attrs.href !== undefined) {
      return <a {...buttonProps} ref="buttonNode">
        {iconNode}
        {kids}
      </a>;
    }
    const buttonNode = <button {...buttonProps} ref="buttonNode" type={htmlType || 'button'}>
      {iconNode}
      {kids}
    </button>;
    if (type === 'link') {
      return buttonNode;
    }
    return <Wave>{buttonNode}</Wave>;
  }
});

export default component;
