import classNames from 'classnames';
import {App, ComponentInternalInstance, defineComponent, getCurrentInstance, h} from 'vue';
import VueIcon from '../../libs/icons-vue';
import {filterEmpty} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import Base from '../base';
import locale, {Locale} from '../locale/default';
import createFromIconfontCN from './IconFont';
import {getTwoToneColor, setTwoToneColor} from './twoTonePrimaryColor';
import {alias, getThemeFromTypeName, removeTypeTheme, svgBaseProps, withThemeSuffix} from './utils';

// Initial setting

setTwoToneColor('#1890ff');
const defaultTheme = 'outlined';

function renderIcon(locale: Locale, context: ComponentInternalInstance) {
  const {props, slots} = context;
  const {
    // affect inner <svg>...</svg>
    type,
    component: Component,
    viewBox,
    spin,
    // other
    theme, // default to outlined
    twoToneColor,
    rotate,
    tabIndex
  } = props as any;
  let children = filterEmpty(slots.default);
  children = children.length === 0 ? undefined : children;
  warning(
      Boolean(type || Component || children),
      'Icon',
      'Icon should have `type` prop or `component` prop or `children`.'
  );

  const classString = classNames({
    [`anticon`]: true,
    [`anticon-${type}`]: !!type
  });

  const svgClassString = classNames({
    [`anticon-spin`]: !!spin || type === 'loading'
  });

  const svgStyle = rotate
      ? {
        msTransform: `rotate(${rotate}deg)`,
        transform: `rotate(${rotate}deg)`
      }
      : undefined;

  const innerSvgProps = {
    attrs: {
      ...svgBaseProps,
      viewBox
    },
    class: svgClassString,
    style: svgStyle
  };
  if (!viewBox) {
    delete innerSvgProps.attrs.viewBox;
  }

  const renderInnerNode = () => {
    // component > children > type
    if (Component) {
      return <Component {...innerSvgProps}>
        {children}
      </Component>;
    }
    if (children && children.length) {
      warning(
          Boolean(viewBox) || (children.length === 1 && children[0].type === 'use'),
          'Icon',
          'Make sure that you provide correct `viewBox`' +
          ' prop (default `0 0 1024 1024`) to the icon.'
      );
      const innerSvgProps = {
        attrs: {
          ...svgBaseProps
        },
        class: svgClassString,
        style: svgStyle
      };
      return <svg {...innerSvgProps} view-box={viewBox}>
        {children}
      </svg>;
    }

    if (typeof type === 'string') {
      let computedType = type;
      if (theme) {
        const themeInName = getThemeFromTypeName(type);
        warning(
            !themeInName || theme === themeInName,
            'Icon',
            `The icon name '${type}' already specify a theme '${themeInName}',` +
            ` the 'theme' prop '${theme}' will be ignored.`
        );
      }
      computedType = withThemeSuffix(
          removeTypeTheme(alias(computedType)), theme || defaultTheme
      );
      return <VueIcon focusable={false}
                      class={svgClassString}
                      type={computedType}
                      primaryColor={twoToneColor}
                      style={svgStyle}/>;
    }
  };
  let iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && 'onClick' in props) {
    iconTabIndex = -1;
  }
  // functional component not support nativeOn，https://github.com/vuejs/vue/issues/7526
  const iProps: any = {
    'aria-label': type && `${locale.Icon.icon}: ${type}`,
    ...context.attrs,
    class: classString
  };
  if (iconTabIndex !== undefined) {
    iProps.tabindex = iconTabIndex;
  }
  return <i {...iProps}>{renderInnerNode()}</i>;
}

const COMPONENT_NAME = 'AIcon';
const Icon: any = defineComponent({
  name: COMPONENT_NAME,
  props: {
    tabIndex: PropTypes.number,
    type: PropTypes.string,
    component: PropTypes.any,
    viewBox: PropTypes.any,
    spin: PropTypes.bool.def(false),
    rotate: PropTypes.number,
    theme: PropTypes.oneOf(['filled', 'outlined', 'twoTone']),
    twoToneColor: PropTypes.string,
    role: PropTypes.string
  },
  render() {
    const instance = getCurrentInstance();
    return renderIcon(locale, instance);
  }
});
Icon.createFromIconfontCN = createFromIconfontCN;
Icon.getTwoToneColor = getTwoToneColor;
Icon.setTwoToneColor = setTwoToneColor;
Icon.install = (app: App) => {
  app.use(Base);
  app.component(COMPONENT_NAME, Icon);
};
export default Icon;
