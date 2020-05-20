import classnames from 'classnames';
import raf from 'raf';
import Trigger from '../vc-trigger';
import PropTypes from '../_util/vue-types';
import DropdownMenu from './dropdown-menu';
import {isSingleMode, saveRef} from './util';
import BaseMixin from '../_util/base-mixin';
import {getListenersFromProps} from '../_util/props-util';
import {ref, h} from 'vue';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1
    }
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1
    }
  }
};

export default {
  name: 'SelectTrigger',
  mixins: [BaseMixin],
  props: {
    // onPopupFocus: PropTypes.func,
    // onPopupScroll: PropTypes.func,
    dropdownMatchSelectWidth: PropTypes.bool,
    defaultActiveFirstOption: PropTypes.bool,
    dropdownAlign: PropTypes.object,
    visible: PropTypes.bool,
    disabled: PropTypes.bool,
    showSearch: PropTypes.bool,
    dropdownClassName: PropTypes.string,
    dropdownStyle: PropTypes.object,
    dropdownMenuStyle: PropTypes.object,
    multiple: PropTypes.bool,
    inputValue: PropTypes.string,
    filterOption: PropTypes.any,
    empty: PropTypes.bool,
    options: PropTypes.any,
    prefixCls: PropTypes.string,
    popupClassName: PropTypes.string,
    value: PropTypes.array,
    // children: PropTypes.any,
    showAction: PropTypes.arrayOf(PropTypes.string),
    combobox: PropTypes.bool,
    animation: PropTypes.string,
    transitionName: PropTypes.string,
    getPopupContainer: PropTypes.func,
    backfillValue: PropTypes.any,
    menuItemSelectedIcon: PropTypes.any,
    dropdownRender: PropTypes.func,
    ariaId: PropTypes.string
  },
  data() {
    return {
      dropdownWidth: 0
    };
  },
  created() {
    this.rafInstance = null;
    this.saveDropdownMenuRef = saveRef(this, 'dropdownMenuRef');
  },

  mounted() {
    this.$nextTick(() => {
      this.setDropdownWidth();
    });
  },

  updated() {
    this.$nextTick(() => {
      this.setDropdownWidth();
    });
  },
  beforeDestroy() {
    this.cancelRafInstance();
  },
  methods: {
    setDropdownWidth() {
      this.cancelRafInstance();
      this.rafInstance = raf(() => {
        const width = this.$el.offsetWidth;
        if (width !== this.dropdownWidth) {
          this.dropdownWidth = width;
        }
      });
    },
    cancelRafInstance() {
      if (this.rafInstance) {
        raf.cancel(this.rafInstance);
      }
    },
    getInnerMenu() {
      return this.dropdownMenuRef && this.dropdownMenuRef.$refs.menuRef;
    },

    getDropdownElement(newProps) {
      const {
        value,
        firstActiveValue,
        defaultActiveFirstOption,
        dropdownMenuStyle,
        getDropdownPrefixCls,
        backfillValue,
        menuItemSelectedIcon
      } = this;
      const {menuSelect, menuDeselect, popupScroll} = getListenersFromProps(this);
      const props = this.$props;

      const {dropdownRender, ariaId} = props;
      const dropdownMenuProps = {
        ...newProps,
        ariaId,
        prefixCls: getDropdownPrefixCls(),
        value,
        firstActiveValue,
        defaultActiveFirstOption,
        dropdownMenuStyle,
        backfillValue,
        menuItemSelectedIcon,
        onMenuSelect: menuSelect,
        onMenuDeselect: menuDeselect,
        onPopupScroll: popupScroll,
        saveDropdownMenuRef: this.saveDropdownMenuRef
      };
      return <DropdownMenu {...dropdownMenuProps} />;
    },
    getDropdownTransitionName() {
      const props = this.$props;
      let transitionName = props.transitionName;
      if (!transitionName && props.animation) {
        transitionName = `${this.getDropdownPrefixCls()}-${props.animation}`;
      }
      return transitionName;
    },

    getDropdownPrefixCls() {
      return `${this.prefixCls}-dropdown`;
    }
  },
  setup() {
    const triggerRef = ref(null);
    const dropdownMenuRef = ref(null);
    const getPopupDOMNode = () => {
      return triggerRef.value.getPopupDomNode();
    };
    const saveDropdownMenuRef = (el) => {
      dropdownMenuRef.value = el;
    };
    return {
      saveDropdownMenuRef,
      setTriggerRef: (el) => triggerRef.value = el,
      getPopupDOMNode
    };
  },
  render(ctx) {
    const {$props, $slots} = this;
    const {
      multiple,
      visible,
      inputValue,
      dropdownAlign,
      disabled,
      showSearch,
      dropdownClassName,
      dropdownStyle,
      dropdownMatchSelectWidth,
      options,
      getPopupContainer,
      showAction,
      empty
    } = $props;
    const {mouseenter, mouseleave, popupFocus, dropdownVisibleChange} = getListenersFromProps(this);
    const dropdownPrefixCls = this.getDropdownPrefixCls();
    const popupClassName = {
      [dropdownClassName]: !!dropdownClassName,
      [`${dropdownPrefixCls}--${multiple ? 'multiple' : 'single'}`]: 1,
      [`${dropdownPrefixCls}--empty`]: empty
    };
    const popupElement = this.getDropdownElement({
      menuItems: options,
      multiple,
      inputValue,
      visible,
      onPopupFocus: popupFocus
    });
    let hideAction;
    if (disabled) {
      hideAction = [];
    } else if (isSingleMode($props) && !showSearch) {
      hideAction = ['click'];
    } else {
      hideAction = ['blur'];
    }
    const popupStyle = {...dropdownStyle};
    const widthProp = dropdownMatchSelectWidth ? 'width' : 'minWidth';
    if (this.dropdownWidth) {
      popupStyle[widthProp] = `${this.dropdownWidth}px`;
    }
    const triggerProps = {
      ...$props,
      showAction: disabled ? [] : showAction,
      hideAction,
      ref: ctx.setTriggerRef,
      popupPlacement: 'bottomLeft',
      builtinPlacements: BUILT_IN_PLACEMENTS,
      prefixCls: dropdownPrefixCls,
      popupTransitionName: this.getDropdownTransitionName(),
      popupAlign: dropdownAlign,
      popupVisible: visible,
      getPopupContainer,
      popupClassName: classnames(popupClassName),
      popupStyle,
      onPopupVisibleChange: dropdownVisibleChange
    };
    if (mouseenter) {
      triggerProps.onMouseenter = mouseenter;
    }
    if (mouseleave) {
      triggerProps.onMouseleave = mouseleave;
    }
    return <Trigger {...triggerProps}>
      {$slots.default && $slots.default()}
      <template slot="popup">
        {popupElement}
      </template>
    </Trigger>;
  }
} as any;
