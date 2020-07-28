import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {useState} from '@/tools/state';
import debounce from 'lodash/debounce';
import omit from 'omit.js';
import {defineComponent, reactive, watch} from 'vue';
import {getComponentFromContext, getListenersFromContext, initDefaultProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import {conductExpandParent, convertTreeToEntities} from '../vc-tree/src/util';
import Tree, {TreeProps} from './tree';
import {calcRangeKeys, convertDirectoryKeysToNodes, getFullKeyList, getFullKeyListByTreeData} from './util';

// export type ExpandAction = false | 'click' | 'dblclick'; export interface
// DirectoryTreeProps extends TreeProps {   expandAction?: ExpandAction; }
// export interface DirectoryTreeState {   expandedKeys?: string[];
// selectedKeys?: string[]; }

function getIcon(props) {
  const {isLeaf, expanded} = props;
  if (isLeaf) {
    return <Icon type="file"/>;
  }
  return <Icon type={expanded ? 'folder-open' : 'folder'}/>;
}

export default defineComponent({
  name: 'ADirectoryTree',
  props: initDefaultProps(
      {
        ...TreeProps(),
        expandAction: PropTypes.oneOf([false, 'click', 'doubleclick', 'dblclick'])
      },
      {
        showIcon: true,
        expandAction: 'click'
      }
  ),
  setup($props, {emit, slots}) {
    const {getRef, saveRef} = useRefs();
    const expandFolderNode = (event, node) => {
      const {isLeaf} = node;

      if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
        return;
      }

      if (getRef('tree').$refs.tree) {
        // Get internal vc-tree
        const internalTree = getRef('tree').$refs.tree;

        // Call internal rc-tree expand function
        // https://github.com/ant-design/ant-design/issues/12567
        internalTree.onNodeExpand(event, node);
      }
    };
    const getState = () => {
      const props = $props;
      const {defaultExpandAll, defaultExpandParent, expandedKeys, defaultExpandedKeys} = props;
      const {keyEntities} = convertTreeToEntities(slots.default());
      const state: any = {};
      // Selected keys
      state._selectedKeys = props.selectedKeys || props.defaultSelectedKeys || [];

      // Expanded keys
      if (defaultExpandAll) {
        if (props.treeData) {
          state._expandedKeys = getFullKeyListByTreeData(props.treeData);
        } else {
          state._expandedKeys = getFullKeyList(slots.default());
        }
      } else if (defaultExpandParent) {
        state._expandedKeys = conductExpandParent(expandedKeys || defaultExpandedKeys, keyEntities);
      } else {
        state._expandedKeys = expandedKeys || defaultExpandedKeys;
      }
      return reactive({
        onDebounceExpand: debounce(expandFolderNode, 200, {leading: true}),
        _selectedKeys: [],
        _expandedKeys: [],
        ...state
      });
    };
    const {state: $state, setState} = useState<any>();
    setState(getState());
    watch(() => $props.expandedKeys, (val) => {
      setState({_expandedKeys: val});
    });
    watch(() => $props.selectedKeys, (val) => {
      setState({_selectedKeys: val});
    });
    const onExpand = (expandedKeys, info) => {
      setUncontrolledState({_expandedKeys: expandedKeys});
      emit('expand', expandedKeys, info);
      return undefined;
    };
    const onClick = (event, node) => {
      const {expandAction} = $props;
      // Expand the tree
      if (expandAction === 'click') {
        if (!node) {
          console.warn('[ATree] node data missing when clicked!')
        }
        $state.onDebounceExpand(event, node);
      }
      emit('click', event, node);
    };
    const onDoubleClick = (event, node) => {
      const {expandAction} = $props;

      // Expand the tree
      if (expandAction === 'dblclick' || expandAction === 'doubleclick') {
        $state.onDebounceExpand(event, node);
      }

      emit('doubleclick', event, node);
      emit('dblclick', event, node);
    };
    const onSelect = (keys, event) => {
      const {multiple} = $props;
      const children = slots.default && slots.default() || [];
      const {_expandedKeys: expandedKeys = []} = $state;
      const {node, nativeEvent} = event;
      const {eventKey = ''} = node;

      const newState: any = {};

      // We need wrap this event since some value is not same
      const newEvent = {
        ...event,
        selected: true // Directory selected always true
      };

      // Windows / Mac single pick
      const ctrlPick = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const shiftPick = nativeEvent.shiftKey;

      // Generate new selected keys
      let newSelectedKeys;
      if (multiple && ctrlPick) {
        // Control click
        newSelectedKeys = keys;
        $state.lastSelectedKey = eventKey;
        $state.cachedSelectedKeys = newSelectedKeys;
        newEvent.selectedNodes = convertDirectoryKeysToNodes(children, newSelectedKeys);
      } else if (multiple && shiftPick) {
        // Shift click
        newSelectedKeys = Array.from(
            new Set([
              ...($state.cachedSelectedKeys || []),
              ...calcRangeKeys(children, expandedKeys, eventKey, $state.lastSelectedKey)
            ])
        );
        newEvent.selectedNodes = convertDirectoryKeysToNodes(children, newSelectedKeys);
      } else {
        // Single click
        newSelectedKeys = [eventKey];
        $state.lastSelectedKey = eventKey;
        $state.cachedSelectedKeys = newSelectedKeys;
        newEvent.selectedNodes = [event.node];
      }
      newState._selectedKeys = newSelectedKeys;

      emit('update:selectedKeys', newSelectedKeys);
      emit('select', newSelectedKeys, newEvent);

      setUncontrolledState(newState);
    };
    const setUncontrolledState = (state) => {
      const newState = omit(
          state,
          Object.keys($props).map(p => `_${p}`)
      );
      if (Object.keys(newState).length) {
        setState(newState);
      }
    };
    return {
      onExpand,
      saveRef,
      onClick,
      onDoubleClick,
      onSelect,
      expandFolderNode,
      setUncontrolledState,
      configProvider: useConfigProvider(),
      $state
    };
  },
  render() {
    const {prefixCls: customizePrefixCls, ...props} = this.$props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('tree', customizePrefixCls);
    const {_expandedKeys: expandedKeys, _selectedKeys: selectedKeys} = this.$state;
    const listeners = getListenersFromContext(this);
    warning(!listeners.doubleclick, '`doubleclick` is deprecated. please use `dblclick` instead.');
    const treeProps = {
      ...props,
      icon: getIcon,
      prefixCls,
      expandedKeys,
      selectedKeys,
      switcherIcon: getComponentFromContext(this, 'switcherIcon'),
      ref: this.saveRef('tree'),
      class: `${prefixCls}-directory`,
      ...omit(listeners, ['onUpdate:selectedKeys']),
      onSelect: this.onSelect,
      onClick: this.onClick,
      onDblclick: this.onDoubleClick,
      onExpand: this.onExpand
    };
    return <Tree {...treeProps}>{this.$slots.default && this.$slots.default()}</Tree>;
  }
});
