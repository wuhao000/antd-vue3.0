import classNames from 'classnames';
import {App, Component, CSSProperties, defineComponent, getCurrentInstance, h, provide, ref} from 'vue';
import {getPrefixCls} from '../_util/prefix';
import {getListenersFromProps, getListenersFromInstance, getOptionProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Sider from './sider';

export const BasicProps = {
  prefixCls: PropTypes.string,
  hasSider: PropTypes.bool,
  tagName: PropTypes.string
};

function generator({suffixCls, tagName, name}: {
  suffixCls: string, tagName: string, name: string
}) {
  return (BasicComponent: any) => {
    return {
      name,
      props: BasicComponent.props,
      setup() {
        return {};
      },
      render(ctx) {
        const instance = getCurrentInstance();
        const attrs = instance.attrs;
        const {prefixCls: customizePrefixCls} = this.$props;
        const prefixCls = getPrefixCls(suffixCls, customizePrefixCls);
        const style: CSSProperties = {};
        if (attrs.height) {
          style.height = attrs.height.toString();
        }
        const basicComponentProps = {
          prefixCls,
          ...getOptionProps(this),
          tagName,
          ...getListenersFromInstance(instance),
          style
        };
        return <BasicComponent {...basicComponentProps}>
          {this.$slots.default && this.$slots.default()}
        </BasicComponent>;
      }
    } as Component;
  };
}

const Basic = {
  props: BasicProps,
  render() {
    const instance = getCurrentInstance();
    const {prefixCls, tagName: Tag, $slots} = this;
    const divProps = {
      class: prefixCls,
      ...getListenersFromInstance(instance)
    };
    return <Tag {...divProps}>{$slots.default()}</Tag>;
  }
} as Component;

const BasicLayout = defineComponent({
  props: BasicProps,
  setup() {
    const siders = ref([] as string[]);
    provide('siderHook', {
      addSider: (id: string) => {
        siders.value = [...siders.value, id];
      },
      removeSider: (id: string) => {
        siders.value = siders.value.filter(currentId => currentId !== id);
      }
    });
    return {siders};
  },
  render() {
    const {prefixCls, $slots, hasSider, tagName: Tag} = this;
    const divCls = classNames(prefixCls, {
      [`${prefixCls}-has-sider`]: typeof hasSider === 'boolean' ? hasSider : this.siders.length > 0
    });
    const instance = getCurrentInstance();
    const divProps = {
      class: divCls,
      ...getListenersFromInstance(instance)
    };
    return <Tag {...divProps}>
      {$slots.default && $slots.default()}
    </Tag>;
  }
});

const Layout = generator({
  suffixCls: 'layout',
  tagName: 'section',
  name: 'ALayout'
})(BasicLayout as any) as Component & {
  Sider?: typeof Sider,
  Header: Component,
  Footer: Component,
  Content: Component,
  install: (app: App) => any
} as any;

const Header = generator({
  suffixCls: 'layout-header',
  tagName: 'header',
  name: 'ALayoutHeader'
})(Basic);

const Footer = generator({
  suffixCls: 'layout-footer',
  tagName: 'footer',
  name: 'ALayoutFooter'
})(Basic);

const Content = generator({
  suffixCls: 'layout-content',
  tagName: 'main',
  name: 'ALayoutContent'
})(Basic);

Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;

export default Layout;
