import _extends from 'babel-runtime/helpers/extends';
import {defineComponent, ref} from 'vue';
import {generate, getSecondaryColor, isIconDefinition, log, MiniMap, withSuffix} from '../utils';

var defaultTwoToneColorPalette = {
  primaryColor: '#333',
  secondaryColor: '#E6E6E6'
};

var Icon = defineComponent({
  name: 'AntdIcon',
  props: ['type', 'primaryColor', 'secondaryColor'],
  displayName: 'IconVue',
  definitions: new MiniMap(),
  setup() {
    const twoToneColorPalette = ref(defaultTwoToneColorPalette);
    return {twoToneColorPalette};
  },
  add(...names: any[]) {
    names.forEach(function(icon) {
      Icon.definitions.set(withSuffix(icon.name, icon.theme), icon);
    });
  },
  clear() {
    Icon.definitions.clear();
  },
  get(key) {
    const colors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultTwoToneColorPalette;
    if (key) {
      let target = Icon.definitions.get(key);
      if (target && typeof target.icon === 'function') {
        target = _extends({}, target, {
          icon: target.icon(colors.primaryColor, colors.secondaryColor)
        });
      }
      return target;
    }
  },
  setTwoToneColors(_ref) {
    const primaryColor = _ref.primaryColor,
        secondaryColor = _ref.secondaryColor;
    defaultTwoToneColorPalette.primaryColor = primaryColor;
    defaultTwoToneColorPalette.secondaryColor = secondaryColor || getSecondaryColor(primaryColor);
  },
  getTwoToneColors: function getTwoToneColors() {
    return _extends({}, defaultTwoToneColorPalette);
  },
  render() {
    const _$props = this.$props,
        type = _$props.type,
        primaryColor = _$props.primaryColor,
        secondaryColor = _$props.secondaryColor;
    let target = void 0;
    let colors = defaultTwoToneColorPalette;
    if (primaryColor) {
      colors = {
        primaryColor: primaryColor,
        secondaryColor: secondaryColor || getSecondaryColor(primaryColor)
      };
    }
    if (isIconDefinition(type)) {
      target = type;
    } else if (typeof type === 'string') {
      target = Icon.get(type, colors);
      if (!target) {
        // log(`Could not find icon: ${type}`);
        return null;
      }
    }
    if (!target) {
      log('type should be string or icon definiton, but got ' + type);
      return null;
    }
    if (target && typeof target.icon === 'function') {
      target = _extends({}, target, {
        icon: target.icon(colors.primaryColor, colors.secondaryColor)
      });
    }
    return generate(target.icon, 'svg-' + target.name, {
      'data-icon': target.name,
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      'aria-hidden': 'true'
    });
  }
});

/* istanbul ignore next */
Icon.install = function(Vue) {
  Vue.component(Icon.name, Icon);
};

export default Icon;
