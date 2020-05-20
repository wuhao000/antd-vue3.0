import raf from 'raf';
import PropTypes from '../_util/vue-types';
import Menu from '../vc-menu';
import scrollIntoView from 'dom-scroll-into-view';
import {getSelectKeys, preventDefaultEvent} from './util';
import {cloneElement} from '../_util/vnode';
import {getSlotOptions, getComponentFromProp, getListenersFromProps} from '../_util/props-util';
import {getCurrentInstance, watch, ref, nextTick, onMounted, onUpdated, onBeforeUnmount, defineComponent} from 'vue';

export default defineComponent({
  name: 'DropdownMenu',
  props: {
    ariaId: PropTypes.string,
    defaultActiveFirstOption: PropTypes.bool,
    value: PropTypes.any,
    dropdownMenuStyle: PropTypes.object,
    multiple: PropTypes.bool,
    // onPopupFocus: PropTypes.func,
    // onPopupScroll: PropTypes.func,
    // onMenuDeSelect: PropTypes.func,
    // onMenuSelect: PropTypes.func,
    prefixCls: PropTypes.string,
    menuItems: PropTypes.any,
    inputValue: PropTypes.string,
    visible: PropTypes.bool,
    backfillValue: PropTypes.any,
    firstActiveValue: PropTypes.string,
    menuItemSelectedIcon: PropTypes.any
  },
  setup(props, {attrs}) {
    const lastVisible = ref(props.visible);
    const lastInputValue = ref(props.inputValue);
    const prevVisible = ref(props.visible);
    const rafInstance = ref(null);
    const firstActiveItem = ref(null);
    watch(() => props.visible, (val) => {
      if (!val) {
        lastVisible.value = val;
      } else {
        nextTick(() => {
          scrollActiveItemToView();
        });
      }
    });
    // watch(() => props, (v) => {
      // console.log(v)
    // }, {deep: true});
    const menuRef = ref(null);
    const renderMenu = () => {
      const {
        menuItems,
        defaultActiveFirstOption,
        value,
        prefixCls,
        multiple,
        inputValue,
        firstActiveValue,
        dropdownMenuStyle,
        backfillValue,
        visible
      } = props;
      const menuItemSelectedIcon = getComponentFromProp(getCurrentInstance(), 'menuItemSelectedIcon');
      const {menuDeselect, menuSelect, popupScroll} = getListenersFromProps(attrs);
      if (menuItems && menuItems.length) {
        const selectedKeys = getSelectKeys(menuItems, value);
        const menuProps: any = {
          multiple,
          itemIcon: multiple ? menuItemSelectedIcon : null,
          selectedKeys,
          prefixCls: `${prefixCls}-menu`,
          style: dropdownMenuStyle,
          ref: (el) => menuRef.value = el,
          role: 'listbox'
        };
        if (popupScroll) {
          menuProps.onScroll = popupScroll;
        }
        if (multiple) {
          menuProps.onDeselect = menuDeselect;
          menuProps.onSelect = menuSelect;
        } else {
          menuProps.onClick = menuSelect;
        }
        const activeKeyProps: { activeKey?: string } = {};

        let defaultActiveFirst = defaultActiveFirstOption;
        let clonedMenuItems = menuItems;
        if (selectedKeys.length || firstActiveValue) {
          if (props.visible && !lastVisible.value) {
            activeKeyProps.activeKey = selectedKeys[0] || firstActiveValue;
          } else if (!visible) {
            // Do not trigger auto active since we already have selectedKeys
            if (selectedKeys[0]) {
              defaultActiveFirst = false;
            }
            activeKeyProps.activeKey = undefined;
          }
          let foundFirst = false;
          // set firstActiveItem via cloning menus
          // for scroll into view
          const clone = item => {
            if (
                (!foundFirst && selectedKeys.indexOf(item.key) !== -1) ||
                (!foundFirst && !selectedKeys.length && firstActiveValue.indexOf(item.key) !== -1)
            ) {
              foundFirst = true;
              return cloneElement(item, {
                ref: ref => {
                  firstActiveItem.value = ref;
                }
              });
            }
            return item;
          };

          clonedMenuItems = menuItems.map(item => {
            if (getSlotOptions(item).isMenuItemGroup) {
              const children = item.componentOptions.children.map(clone);
              return cloneElement(item, {children});
            }
            return clone(item);
          });
        } else {
          // Clear firstActiveItem when dropdown menu items was empty
          // Avoid `Unable to find node on an unmounted component`
          // https://github.com/ant-design/ant-design/issues/10774
          firstActiveItem.value = null;
        }

        // clear activeKey when inputValue change
        const lastValue = value && value[value.length - 1];
        if (inputValue !== lastInputValue.value && (!lastValue || lastValue !== backfillValue)) {
          activeKeyProps.activeKey = '';
        }
        menuProps.props = {...activeKeyProps, ...menuProps.props, defaultActiveFirst};
        return <Menu {...menuProps}>{clonedMenuItems}</Menu>;
      }
      return null;
    };
    const scrollActiveItemToView = () => {
      // scroll into view
      const itemComponent = firstActiveItem.value && firstActiveItem.value.$el;
      const {value, visible, firstActiveValue} = props;
      if (!itemComponent || !visible) {
        return;
      }
      const scrollIntoViewOpts: { onlyScrollIfNeeded: boolean, alignWithTop?: boolean } = {
        onlyScrollIfNeeded: true
      };
      if ((!value || value.length === 0) && firstActiveValue) {
        scrollIntoViewOpts.alignWithTop = true;
      }
      // Delay to scroll since current frame item position is not ready when pre view is by filter
      // https://github.com/ant-design/ant-design/issues/11268#issuecomment-406634462
      rafInstance.value = raf(() => {
        scrollIntoView(itemComponent, menuRef.value.$el, scrollIntoViewOpts);
      });
    };
    onMounted(() => {
      nextTick(() => {
        scrollActiveItemToView();
      });
    });
    onUpdated(() => {
      // if (!this.prevVisible && props.visible) {
      //   this.$nextTick(() => {
      //     this.scrollActiveItemToView();
      //   });
      // }
      lastVisible.value = props.visible;
      lastInputValue.value = props.inputValue;
      prevVisible.value = props.visible;
    });
    onBeforeUnmount(() => {
      if (rafInstance.value) {
        raf.cancel(rafInstance.value);
      }
    });
    return {renderMenu};
  },
  render(ctx) {
    const renderMenu = ctx.renderMenu();
    const {popupFocus, popupScroll} = getListenersFromProps(this.$attrs);
    return renderMenu ? (
        <div
            style={{
              overflow: 'auto',
              transform: 'translateZ(0)'
            }}
            id={this.$props.ariaId}
            tabindex={-1}
            onFocus={popupFocus}
            onMousedown={preventDefaultEvent}
            onScroll={popupScroll}
            ref="menuContainer"
        >
          {renderMenu}
        </div>
    ) : null;
  }
}) as any;
