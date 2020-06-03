import classNames from 'classnames';
import {defineComponent, getCurrentInstance, inject, onBeforeUnmount, onMounted, onUpdated, provide, ref, Transition} from 'vue';
import getTransitionProps from '../../_util/get-transition-props';
import {filterEmpty, getComponentFromContext, initDefaultProps, unwrapFragment} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import {useTree} from './tree';
import {getRealNodeChildren, mapChildren, warnOnlyTreeNode} from './util';

function noop() {
}

const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';

const defaultTitle = '---';

const TreeNode = defineComponent({
  name: 'TreeNode',
  __ANT_TREE_NODE: true,
  props: initDefaultProps(
      {
        eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Pass by parent `cloneElement`
        prefixCls: PropTypes.string,
        // className: PropTypes.string,
        root: PropTypes.object,
        // onSelect: PropTypes.func,

        // By parent
        expanded: PropTypes.bool,
        selected: PropTypes.bool,
        checked: PropTypes.bool,
        loaded: PropTypes.bool,
        loading: PropTypes.bool,
        halfChecked: PropTypes.bool,
        title: PropTypes.any,
        pos: PropTypes.string,
        dragOver: PropTypes.bool,
        dragOverGapTop: PropTypes.bool,
        dragOverGapBottom: PropTypes.bool,

        // By user
        isLeaf: PropTypes.bool,
        checkable: PropTypes.bool,
        selectable: PropTypes.bool,
        disabled: PropTypes.bool,
        disableCheckbox: PropTypes.bool,
        icon: PropTypes.any,
        dataRef: PropTypes.object,
        switcherIcon: PropTypes.any,
        label: PropTypes.any,
        value: PropTypes.any
      },
      {}
  ),
  setup($props, {emit, slots}) {
    const dragNodeHighlight = ref(false);
    const instance = getCurrentInstance();
    const vcTreeNode = inject('vcTreeNode');
    provide('vcTreeNode', instance);
    const vcTree = useTree();
    const onSelectorClick = (e) => {
      // Click trigger before select/check operation
      const onNodeClick = vcTree.onNodeClick;
      onNodeClick(e, instance);
      if (isSelectable()) {
        onSelect(e);
      } else {
        onCheck(e);
      }
    };
    const onSelectorDoubleClick = (e) => {
      const onNodeDoubleClick = vcTree.onNodeDoubleClick;
      onNodeDoubleClick(e, instance);
    };
    const onSelect = (e) => {
      if (isDisabled()) {
        return;
      }
      const onNodeSelect = vcTree.onNodeSelect;
      e.preventDefault();
      onNodeSelect(e, instance);
    };
    const onCheck = (e) => {
      if (isDisabled()) {
        return;
      }

      const {disableCheckbox, checked} = $props;
      const onNodeCheck = vcTree.onNodeCheck;

      if (!isCheckable() || disableCheckbox) {
        return;
      }

      e.preventDefault();
      const targetChecked = !checked;
      onNodeCheck(e, instance, targetChecked);
    };
    const onMouseEnter = (e) => {
      const onNodeMouseEnter = vcTree.onNodeMouseEnter;
      onNodeMouseEnter(e, instance);
    };
    const onMouseLeave = (e) => {
      const onNodeMouseLeave = vcTree.onNodeMouseLeave;
      onNodeMouseLeave(e, instance);
    };
    const onContextMenu = (e) => {
      const onNodeContextMenu = vcTree.onNodeContextMenu;
      onNodeContextMenu(e, instance);
    };
    const onDragStart = (e) => {
      const onNodeDragStart = vcTree.onNodeDragStart;
      e.stopPropagation();
      dragNodeHighlight.value = true;
      onNodeDragStart(e, instance);

      try {
        // ie throw error
        // firefox-need-it
        e.dataTransfer.setData('text/plain', '');
      } catch (error) {
        // empty
      }
    };
    const onDragEnter = (e) => {
      const onNodeDragEnter = vcTree.onNodeDragEnter;

      e.preventDefault();
      e.stopPropagation();
      onNodeDragEnter(e, instance);
    };
    const onDragOver = (e) => {
      const onNodeDragOver = vcTree.onNodeDragOver;
      e.preventDefault();
      e.stopPropagation();
      onNodeDragOver(e, instance);
    };
    const onDragLeave = (e) => {
      const onNodeDragLeave = vcTree.onNodeDragLeave;

      e.stopPropagation();
      onNodeDragLeave(e, instance);
    };
    const onDragEnd = (e) => {
      const onNodeDragEnd = vcTree.onNodeDragEnd;

      e.stopPropagation();
      dragNodeHighlight.value = false;
      onNodeDragEnd(e, instance);
    };
    const onDrop = (e) => {
      const onNodeDrop = vcTree.onNodeDrop;

      e.preventDefault();
      e.stopPropagation();
      dragNodeHighlight.value = false;
      onNodeDrop(e, instance);
    };
    const onExpand = (e) => {
      const onNodeExpand = vcTree.onNodeExpand;
      onNodeExpand(e, instance);
    };
    const getNodeChildren = () => {
      const children: any = slots.default && slots.default();
      const originList = filterEmpty(children);
      const targetList = getRealNodeChildren(originList);
      if (originList.length !== targetList.length) {
        warnOnlyTreeNode();
      }
      return targetList;
    };
    const getNodeState = () => {
      const {expanded} = $props;

      if (isLeaf2()) {
        return null;
      }

      return expanded ? ICON_OPEN : ICON_CLOSE;
    };
    const isLeaf2 = () => {
      const {isLeaf, loaded} = $props;
      const {loadData} = vcTree;

      const hasChildren = getNodeChildren().length !== 0;
      if (isLeaf === false) {
        return false;
      }
      return isLeaf || (!loadData && !hasChildren) || (loadData && loaded && !hasChildren);
    };
    const isDisabled = () => {
      const {disabled} = $props;
      const {disabled: treeDisabled} = vcTree;

      // Follow the logic of Selectable
      if (disabled === false) {
        return false;
      }

      return !!(treeDisabled || disabled);
    };
    const isCheckable = () => {
      const {checkable} = $props;
      const {checkable: treeCheckable} = vcTree;

      // Return false if tree or treeNode is not checkable
      if (!treeCheckable || checkable === false) {
        return false;
      }
      return treeCheckable;
    };
    const syncLoadData = (props) => {
      const {expanded, loading, loaded} = props;
      const {loadData, onNodeLoad} = vcTree;
      if (loading) {
        return;
      }
      // read from state to avoid loadData at same time
      if (loadData && expanded && !isLeaf2()) {
        // We needn't reload data when has children in sync logic
        // It's only needed in node expanded
        const hasChildren = getNodeChildren().length !== 0;
        if (!hasChildren && !loaded) {
          onNodeLoad(instance);
        }
      }
    };
    const isSelectable = () => {
      const {selectable} = $props;
      const {selectable: treeSelectable} = vcTree;

      // Ignore when selectable is undefined or null
      if (typeof selectable === 'boolean') {
        return selectable;
      }

      return treeSelectable;
    };
    const renderSwitcher = () => {
      const {expanded} = $props;
      const {prefixCls} = vcTree;
      const switcherIcon =
          getComponentFromContext({$props, $slots: slots}, 'switcherIcon', {}, false) ||
          getComponentFromContext(vcTree, 'switcherIcon', {}, false);
      if (isLeaf2()) {
        return (
            <span
                key="switcher"
                class={classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher-noop`)}
            >
            {typeof switcherIcon === 'function'
                ? switcherIcon({...$props, ...$props.dataRef, isLeaf: true})
                : switcherIcon}
          </span>
        );
      }

      const switcherCls = classNames(
          `${prefixCls}-switcher`,
          `${prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`
      );
      return (
          <span key="switcher" onClick={onExpand} class={switcherCls}>
          {typeof switcherIcon === 'function'
              ? switcherIcon({...$props, ...$props.dataRef, isLeaf: false})
              : switcherIcon}
        </span>
      );
    };
    const renderCheckbox = () => {
      const {checked, halfChecked, disableCheckbox} = $props;
      const {prefixCls} = vcTree;
      const disabled = isDisabled();
      const checkable = isCheckable();

      if (!checkable) {
        return null;
      }

      // [Legacy] Custom element should be separate with `checkable` in future
      const $custom = typeof checkable !== 'boolean' ? checkable : null;

      return (
          <span
              key="checkbox"
              class={classNames(
                  `${prefixCls}-checkbox`,
                  checked && `${prefixCls}-checkbox-checked`,
                  !checked && halfChecked && `${prefixCls}-checkbox-indeterminate`,
                  (disabled || disableCheckbox) && `${prefixCls}-checkbox-disabled`
              )}
              onClick={onCheck}
          >
          {$custom}
        </span>
      );
    };
    const renderIcon = () => {
      const {loading} = $props;
      const {prefixCls} = vcTree;

      return (
          <span
              key="icon"
              class={classNames(
                  `${prefixCls}-iconEle`,
                  `${prefixCls}-icon__${getNodeState() || 'docu'}`,
                  loading && `${prefixCls}-icon_loading`
              )}
          />
      );
    };
    const renderSelector = () => {
      const {selected, loading} = $props;

      const icon = getComponentFromContext({$props, $slots: slots}, 'icon', {}, false);
      const {prefixCls, showIcon, icon: treeIcon, draggable, loadData} = vcTree;
      const disabled = isDisabled();
      const title = getComponentFromContext({$props, $slots: slots}, 'title', {}, false);
      const wrapClass = `${prefixCls}-node-content-wrapper`;

      // Icon - Still show loading icon when loading without showIcon
      let $icon;

      if (showIcon) {
        const currentIcon = icon || treeIcon;
        $icon = currentIcon ? (
            <span class={classNames(`${prefixCls}-iconEle`, `${prefixCls}-icon__customize`)}>
            {typeof currentIcon === 'function'
                ? currentIcon({...$props, ...$props.dataRef})
                : currentIcon}
          </span>
        ) : (
            renderIcon()
        );
      } else if (loadData && loading) {
        $icon = renderIcon();
      }

      const currentTitle = title;
      let $title = currentTitle ? (
          <span class={`${prefixCls}-title`}>
          {typeof currentTitle === 'function'
              ? currentTitle({...$props, ...$props.dataRef})
              : currentTitle}
        </span>
      ) : (
          <span class={`${prefixCls}-title`}>{defaultTitle}</span>
      );

      return (
          <span
              key="selector"
              ref="selectHandle"
              title={typeof title === 'string' ? title : ''}
              class={classNames(
                  `${wrapClass}`,
                  `${wrapClass}-${getNodeState() || 'normal'}`,
                  !disabled && (selected || dragNodeHighlight.value) && `${prefixCls}-node-selected`,
                  !disabled && draggable && 'draggable'
              )}
              draggable={(!disabled && draggable) || undefined}
              aria-grabbed={(!disabled && draggable) || undefined}
              onMouseenter={onMouseEnter}
              onMouseleave={onMouseLeave}
              onContextmenu={onContextMenu}
              onClick={onSelectorClick}
              onDblclick={onSelectorDoubleClick}
              onDragstart={draggable ? onDragStart : noop}
          >
          {$icon}{$title}
        </span>
      );
    };
    const renderChildren = () => {
      const {expanded, pos} = $props;
      const {prefixCls, openTransitionName, openAnimation, renderTreeNode} = vcTree;

      let animProps = {};
      if (openTransitionName) {
        animProps = getTransitionProps(openTransitionName);
      } else if (typeof openAnimation === 'object') {
        animProps = {...openAnimation};
        Object.assign(animProps, {css: false, ...animProps});
      }

      // Children TreeNode
      const nodeList = getNodeChildren();

      if (nodeList.length === 0) {
        return null;
      }

      let $children;
      if (expanded) {
        $children = (
            <ul class={classNames(
                    `${prefixCls}-child-tree`,
                    expanded && `${prefixCls}-child-tree-open`
                )}
                data-expanded={expanded}
                role="group">
              {mapChildren(unwrapFragment(nodeList), (node, index) => renderTreeNode(node, index, pos))}
            </ul>
        );
      }
      return <Transition {...animProps}>{$children}</Transition>;
    };
    onMounted(() => {
      const {
        eventKey
      } = $props;
      const {registerTreeNode} = vcTree;
      syncLoadData($props);
      registerTreeNode && registerTreeNode(eventKey, instance);
    });
    onUpdated(() => {
      syncLoadData($props);
    });
    onBeforeUnmount(() => {
      const {
        eventKey
      } = $props;
      const {registerTreeNode} = vcTree;
      registerTreeNode && registerTreeNode(eventKey, null);
    });

    return {
      onSelectorClick,
      onSelectorDoubleClick,
      onSelect,
      onCheck,
      onMouseEnter,
      onMouseLeave,
      onContextMenu,
      onDragStart,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDragEnd,
      onDrop,
      onExpand,
      getNodeChildren,
      getNodeState,
      isLeaf2,
      isDisabled,
      isCheckable,
      syncLoadData,
      isSelectable,
      renderSwitcher,
      renderCheckbox,
      renderIcon,
      renderSelector,
      renderChildren,
      vcTree
    };
  },
  render() {
    const {
      dragOver,
      dragOverGapTop,
      dragOverGapBottom,
      isLeaf,
      expanded,
      selected,
      checked,
      halfChecked,
      loading
    } = this.$props;
    const {
      vcTree: {prefixCls, filterTreeNode, draggable}
    } = this;
    const disabled = this.isDisabled();
    return (
        <li
            class={{
              [`${prefixCls}-treenode-disabled`]: disabled,
              [`${prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
              [`${prefixCls}-treenode-checkbox-checked`]: checked,
              [`${prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
              [`${prefixCls}-treenode-selected`]: selected,
              [`${prefixCls}-treenode-loading`]: loading,
              'drag-over': !disabled && dragOver,
              'drag-over-gap-top': !disabled && dragOverGapTop,
              'drag-over-gap-bottom': !disabled && dragOverGapBottom,
              'filter-node': filterTreeNode && filterTreeNode(this)
            }}
            role="treeitem"
            onDragenter={draggable ? this.onDragEnter : noop}
            onDragover={draggable ? this.onDragOver : noop}
            onDragleave={draggable ? this.onDragLeave : noop}
            onDrop={draggable ? this.onDrop : noop}
            onDragend={draggable ? this.onDragEnd : noop}>
          {this.renderSwitcher()}
          {this.renderCheckbox()}
          {this.renderSelector()}
          {this.renderChildren()}
        </li>
    );
  }
});

TreeNode.isTreeNode = 1;

export default TreeNode;
