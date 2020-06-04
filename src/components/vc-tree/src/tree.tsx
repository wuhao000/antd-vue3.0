import {useState} from '@/tools/state';
import {ComponentInternalInstance} from '@vue/runtime-core';
import classNames from 'classnames';
import {defineComponent, getCurrentInstance, inject, provide, ref, watch} from 'vue';
import {getOptionProps, getSlotsFromInstance, initDefaultProps, unwrapFragment} from '../../_util/props-util';
import {cloneElement} from '../../_util/vnode';
import PropTypes from '../../_util/vue-types';
import {
  arrAdd,
  arrDel,
  calcDropPosition,
  calcSelectedKeys,
  conductCheck,
  conductExpandParent,
  convertDataToTree,
  convertTreeToEntities,
  getDragNodesKeys,
  getPosition,
  mapChildren,
  parseCheckedKeys,
  posToArr,
  warnOnlyTreeNode
} from './util';

/**
 * Thought we still use `cloneElement` to pass `key`,
 * other props can pass with context for future refactor.
 */

export const useTree = () => inject('vcTree') as any;

const Tree = defineComponent({
  name: 'Tree',
  inheritAttrs: false,
  props: initDefaultProps(
      {
        prefixCls: PropTypes.string,
        tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        treeData: PropTypes.array, // Generate treeNode by children
        showLine: PropTypes.bool,
        showIcon: PropTypes.bool,
        icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        focusable: PropTypes.bool,
        selectable: PropTypes.bool,
        disabled: PropTypes.bool,
        multiple: PropTypes.bool,
        checkable: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
        checkStrictly: PropTypes.bool,
        draggable: PropTypes.bool,
        defaultExpandParent: PropTypes.bool,
        autoExpandParent: PropTypes.bool,
        defaultExpandAll: PropTypes.bool,
        defaultExpandedKeys: PropTypes.array,
        expandedKeys: PropTypes.array,
        defaultCheckedKeys: PropTypes.array,
        checkedKeys: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        defaultSelectedKeys: PropTypes.array,
        selectedKeys: PropTypes.array,
        loadData: PropTypes.func,
        loadedKeys: PropTypes.array,
        filterTreeNode: PropTypes.func,
        openTransitionName: PropTypes.string,
        openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        switcherIcon: PropTypes.any,
        _propsSymbol: PropTypes.any
      },
      {
        prefixCls: 'rc-tree',
        showLine: false,
        showIcon: true,
        selectable: true,
        multiple: false,
        checkable: false,
        disabled: false,
        checkStrictly: false,
        draggable: false,
        defaultExpandParent: true,
        autoExpandParent: false,
        defaultExpandAll: false,
        defaultExpandedKeys: [],
        defaultCheckedKeys: [],
        defaultSelectedKeys: []
      }
  ),
  provide() {
    return {
      vcTree: this
    };
  },
  setup($props, {emit, slots}) {
    const instance = getCurrentInstance();
    provide('vcTree', instance);
    const getDerivedStateFromProps = (prevState) => {
      const {_prevProps} = prevState;
      const newState: any = {
        _prevProps: {...$props}
      };

      function needSync(name) {
        return (!_prevProps && $props[name] !== undefined) || _prevProps;
      }

      // ================== Tree Node ==================
      let treeNode = null;

      // Check if `treeData` or `children` changed and save into the state.
      if (needSync('treeData')) {
        treeNode = convertDataToTree($props.treeData);
      } else {
        treeNode = slots.default && slots.default();
      }
      // Tree support filter function which will break the tree structure in the vdm.
      // We cache the treeNodes in state so that we can return the treeNode in event trigger.
      if (treeNode) {
        newState._treeNode = treeNode;

        // Calculate the entities data for quick match
        const entitiesMap = convertTreeToEntities(treeNode);
        newState._keyEntities = entitiesMap.keyEntities;
      }

      const keyEntities = newState._keyEntities || prevState._keyEntities;

      // ================ expandedKeys =================
      if ($props.expandedKeys || (_prevProps && $props.autoExpandParent)) {
        newState._expandedKeys =
            $props.autoExpandParent || (!_prevProps && $props.defaultExpandParent)
                ? conductExpandParent($props.expandedKeys, keyEntities)
                : $props.expandedKeys;
      } else if (!_prevProps && $props.defaultExpandAll) {
        newState._expandedKeys = [...keyEntities.keys()];
      } else if (!_prevProps && $props.defaultExpandedKeys) {
        newState._expandedKeys =
            $props.autoExpandParent || $props.defaultExpandParent
                ? conductExpandParent($props.defaultExpandedKeys, keyEntities)
                : $props.defaultExpandedKeys;
      }
      // ================ selectedKeys =================
      if ($props.selectable) {
        if (needSync('selectedKeys')) {
          newState._selectedKeys = calcSelectedKeys($props.selectedKeys, $props);
        } else if (!_prevProps && $props.defaultSelectedKeys) {
          newState._selectedKeys = calcSelectedKeys($props.defaultSelectedKeys, $props);
        }
      }

      // ================= checkedKeys =================
      if ($props.checkable) {
        let checkedKeyEntity;

        if (needSync('checkedKeys')) {
          checkedKeyEntity = parseCheckedKeys($props.checkedKeys) || {};
        } else if (!_prevProps && $props.defaultCheckedKeys) {
          checkedKeyEntity = parseCheckedKeys($props.defaultCheckedKeys) || {};
        } else if (treeNode) {
          // If treeNode changed, we also need check it
          checkedKeyEntity = parseCheckedKeys($props.checkedKeys) || {
            checkedKeys: prevState._checkedKeys,
            halfCheckedKeys: prevState._halfCheckedKeys
          };
        }

        if (checkedKeyEntity) {
          let {checkedKeys = [], halfCheckedKeys = []} = checkedKeyEntity;

          if (!$props.checkStrictly) {
            const conductKeys = conductCheck(checkedKeys, true, keyEntities);
            ({checkedKeys, halfCheckedKeys} = conductKeys);
          }

          newState._checkedKeys = checkedKeys;
          newState._halfCheckedKeys = halfCheckedKeys;
        }
      }
      // ================= loadedKeys ==================
      if (needSync('loadedKeys')) {
        newState._loadedKeys = $props.loadedKeys || [];
      }
      return newState;
    };
    const getState = () => {
      const localState = {
        _posEntities: new Map(),
        _keyEntities: new Map(),
        _expandedKeys: [],
        _selectedKeys: [],
        _checkedKeys: [],
        _halfCheckedKeys: [],
        _loadedKeys: [],
        _loadingKeys: [],
        _treeNode: [],
        _prevProps: null,
        _dragOverNodeKey: '',
        _dropPosition: null,
        _dragNodesKeys: []
      };
      return {
        domTreeNodes: {},
        ...localState,
        ...getDerivedStateFromProps(localState)
      };
    };
    const {state: $state, setState} = useState<any>(getState());
    const createWatch = (keys = []) => {
      keys.forEach(k => {
        watch(() => $props[k], (v) => {
          setState(getDerivedStateFromProps($state));
        });
      });
    };
    watch(() => $state._expandedKeys, (v) => {
      if (v === undefined) {
        throw new Error('1');
      }
    });
    createWatch([
      'treeData',
      'children',
      'expandedKeys',
      'autoExpandParent',
      'selectedKeys',
      'checkedKeys',
      'loadedKeys'
    ]);
    const delayedDragEnterLogic = ref(null);
    const dragNode = ref(undefined);
    const onNodeDragStart = (event, node) => {
      const {_expandedKeys} = $state;
      const {eventKey} = node;
      const children = getSlotsFromInstance(node).default;
      dragNode.value = node;
      setState({
        _dragNodesKeys: getDragNodesKeys(
            typeof children === 'function' ? children() : children,
            node
        ),
        _expandedKeys: arrDel(_expandedKeys, eventKey)
      });
      emit('dragstart', {event, node});
    };
    const onNodeDragEnter = (event, node) => {
      const {_expandedKeys: expandedKeys} = $state;
      const {pos, eventKey} = node.ctx;
      if (!dragNode.value || !node.refs.selectHandle) {
        return;
      }

      const dropPosition = calcDropPosition(event, node);

      // Skip if drag node is self
      if (dragNode.value.eventKey === eventKey && dropPosition === 0) {
        setState({
          _dragOverNodeKey: '',
          _dropPosition: null
        });
        return;
      }

      // Ref: https://github.com/react-component/tree/issues/132
      // Add timeout to let onDragLevel fire before onDragEnter,
      // so that we can clean drag props for onDragLeave node.
      // Macro task for this:
      // https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-script
      setTimeout(() => {
        // Update drag over node
        setState({
          _dragOverNodeKey: eventKey,
          _dropPosition: dropPosition
        });

        // Side effect for delay drag
        if (!delayedDragEnterLogic.value) {
          delayedDragEnterLogic.value = {};
        }
        Object.keys(delayedDragEnterLogic.value).forEach(key => {
          clearTimeout(delayedDragEnterLogic.value[key]);
        });
        delayedDragEnterLogic.value[pos] = setTimeout(() => {
          const newExpandedKeys = arrAdd(expandedKeys, eventKey);
          if ($props.expandedKeys === undefined) {
            setState({
              _expandedKeys: newExpandedKeys
            });
          }
          emit('dragenter', {event, node, expandedKeys: newExpandedKeys});
        }, 400);
      }, 0);
    };
    const onNodeDragOver = (event, node: ComponentInternalInstance) => {
      const {eventKey} = node['ctx'];
      const {_dragOverNodeKey, _dropPosition} = $state;
      // Update drag position
      if (dragNode.value && eventKey === _dragOverNodeKey && node.refs.selectHandle) {
        const dropPosition = calcDropPosition(event, node);

        if (dropPosition === _dropPosition) {
          return;
        }

        setState({
          _dropPosition: dropPosition
        });
      }
      emit('dragover', {event, node});
    };
    const onNodeDragLeave = (event, node: ComponentInternalInstance) => {
      setState({
        _dragOverNodeKey: ''
      });
      emit('dragleave', {event, node});
    };
    const onNodeDragEnd = (event, node: ComponentInternalInstance) => {
      setState({
        _dragOverNodeKey: ''
      });
      emit('dragend', {event, node});
      dragNode.value = null;
    };
    const onNodeDrop = (event, node: ComponentInternalInstance) => {
      const {_dragNodesKeys = [], _dropPosition} = $state;

      const {eventKey, pos} = node['ctx'];

      setState({
        _dragOverNodeKey: ''
      });

      if (_dragNodesKeys.indexOf(eventKey) !== -1) {
        return;
      }

      const posArr = posToArr(pos);

      const dropResult = {
        event,
        node,
        dragNode: dragNode.value,
        dragNodesKeys: _dragNodesKeys.slice(),
        dropPosition: _dropPosition + Number(posArr[posArr.length - 1]),
        dropToGap: false
      };

      if (_dropPosition !== 0) {
        dropResult.dropToGap = true;
      }
      emit('drop', dropResult);
      dragNode.value = null;
    };
    const onNodeClick = (e, treeNode) => {
      console.log('node clicked');
      emit('click', e, treeNode);
    };
    const onNodeDoubleClick = (e, treeNode) => {
      emit('dblclick', e, treeNode);
    };
    const onNodeSelect = (e, treeNode: ComponentInternalInstance) => {
      let {_selectedKeys: selectedKeys} = $state;
      const {_keyEntities: keyEntities} = $state;
      const {multiple} = $props;
      const {selected, eventKey} = getOptionProps(treeNode);
      const targetSelected = !selected;
      // Update selected keys
      if (!targetSelected) {
        selectedKeys = arrDel(selectedKeys, eventKey);
      } else if (!multiple) {
        selectedKeys = [eventKey];
      } else {
        selectedKeys = arrAdd(selectedKeys, eventKey);
      }

      // [Legacy] Not found related usage in doc or upper libs
      const selectedNodes = selectedKeys
          .map(key => {
            const entity = keyEntities.get(key);
            if (!entity) {
              return null;
            }

            return entity.node;
          })
          .filter(node => node);
      setState({_selectedKeys: selectedKeys});
      const eventObj = {
        event: 'select',
        selected: targetSelected,
        node: treeNode,
        selectedNodes,
        nativeEvent: e
      };
      emit('update:selectedKeys', selectedKeys);
      emit('select', selectedKeys, eventObj);
    };
    const onNodeCheck = (e, treeNode, checked) => {
      const {
        _keyEntities: keyEntities,
        _checkedKeys: oriCheckedKeys,
        _halfCheckedKeys: oriHalfCheckedKeys
      } = $state;
      const {checkStrictly} = $props;
      const {eventKey} = getOptionProps(treeNode);

      // Prepare trigger arguments
      let checkedObj;
      const eventObj: any = {
        event: 'check',
        node: treeNode,
        checked,
        nativeEvent: e
      };

      if (checkStrictly) {
        const checkedKeys = checked
            ? arrAdd(oriCheckedKeys, eventKey)
            : arrDel(oriCheckedKeys, eventKey);
        const halfCheckedKeys = arrDel(oriHalfCheckedKeys, eventKey);
        checkedObj = {checked: checkedKeys, halfChecked: halfCheckedKeys};

        eventObj.checkedNodes = checkedKeys
            .map(key => keyEntities.get(key))
            .filter(entity => entity)
            .map(entity => entity.node);

        setState({_checkedKeys: checkedKeys});
      } else {
        const {checkedKeys, halfCheckedKeys} = conductCheck([eventKey], checked, keyEntities, {
          checkedKeys: oriCheckedKeys,
          halfCheckedKeys: oriHalfCheckedKeys
        });

        checkedObj = checkedKeys;

        // [Legacy] This is used for `rc-tree-select`
        eventObj.checkedNodes = [];
        eventObj.checkedNodesPositions = [];
        eventObj.halfCheckedKeys = halfCheckedKeys;

        checkedKeys.forEach(key => {
          const entity = keyEntities.get(key);
          if (!entity) {
            return;
          }

          const {node, pos} = entity;

          eventObj.checkedNodes.push(node);
          eventObj.checkedNodesPositions.push({node, pos});
        });

        setState({
          _checkedKeys: checkedKeys,
          _halfCheckedKeys: halfCheckedKeys
        });
      }
      emit('check', checkedObj, eventObj);
    };
    const onNodeLoad = (treeNode) => {
      return new Promise(resolve => {
        // We need to get the latest state of loading/loaded keys
        setState(({_loadedKeys: loadedKeys = [], _loadingKeys: loadingKeys = []}) => {
          const {loadData} = $props;
          const {eventKey} = getOptionProps(treeNode);
          if (
              !loadData ||
              loadedKeys.indexOf(eventKey) !== -1 ||
              loadingKeys.indexOf(eventKey) !== -1
          ) {
            return {};
          }
          // Process load data
          const promise = loadData(treeNode);
          promise.then(() => {
            const {_loadedKeys: currentLoadedKeys, _loadingKeys: currentLoadingKeys} = $state;
            const newLoadedKeys = arrAdd(currentLoadedKeys, eventKey);
            const newLoadingKeys = arrDel(currentLoadingKeys, eventKey);

            // onLoad should trigger before internal setState to avoid `loadData` trigger twice.
            // https://github.com/ant-design/ant-design/issues/12464
            emit('load', newLoadedKeys, {
              event: 'load',
              node: treeNode
            });
            setState({
              _loadedKeys: newLoadedKeys
            });
            setState({
              _loadingKeys: newLoadingKeys
            });
            resolve();
          });

          return {
            _loadingKeys: arrAdd(loadingKeys, eventKey)
          };
        });
      });
    };
    const onNodeExpand = (e, treeNode) => {
      let {_expandedKeys: expandedKeys} = $state;
      const {loadData} = $props;
      const {eventKey, expanded} = getOptionProps(treeNode);

      // Update selected keys
      const index = expandedKeys.indexOf(eventKey);
      console.warn(
          (expanded && index !== -1) || (!expanded && index === -1),
          'Expand state not sync with index check'
      );
      const targetExpanded = !expanded;
      if (targetExpanded) {
        expandedKeys = arrAdd(expandedKeys, eventKey);
      } else {
        expandedKeys = arrDel(expandedKeys, eventKey);
      }
      setState({_expandedKeys: expandedKeys});
      emit('expand', expandedKeys, {
        node: treeNode,
        expanded: targetExpanded,
        nativeEvent: e
      });
      emit('update:expandedKeys', expandedKeys);
      // Async Load data
      if (targetExpanded && loadData) {
        const loadPromise = onNodeLoad(treeNode);
        return loadPromise
            ? loadPromise.then(() => {
              // [Legacy] Refresh logic
              setUncontrolledState({_expandedKeys: expandedKeys});
            })
            : null;
      }
      return null;
    };
    const onNodeMouseEnter = (event, node) => {
      emit('mouseenter', {event, node});
    };
    const onNodeMouseLeave = (event, node) => {
      emit('mouseleave', {event, node});
    };
    const onNodeContextMenu = (event, node) => {
      event.preventDefault();
      emit('rightClick', {event, node});
    };
    const setUncontrolledState = (state) => {
      let needSync = false;
      const newState = {};
      const props = $props;
      Object.keys(state).forEach(name => {
        if (name.replace('_', '') in props) {
          return;
        }
        needSync = true;
        newState[name] = state[name];
      });
      if (needSync) {
        setState(newState);
      }
    };
    const registerTreeNode = (key, node) => {
      if (node) {
        $state.domTreeNodes[key] = node;
      } else {
        delete $state.domTreeNodes[key];
      }
    };
    const isKeyChecked = (key) => {
      const {_checkedKeys: checkedKeys = []} = $state;
      return checkedKeys.indexOf(key) !== -1;
    };
    const renderTreeNode = (child, index, level = 0) => {
      const {
        _keyEntities: keyEntities,
        _expandedKeys: expandedKeys = [],
        _selectedKeys: selectedKeys = [],
        _halfCheckedKeys: halfCheckedKeys = [],
        _loadedKeys: loadedKeys = [],
        _loadingKeys: loadingKeys = [],
        _dragOverNodeKey: dragOverNodeKey,
        _dropPosition: dropPosition
      } = $state;
      const pos = getPosition(level, index);
      let key = child.key;
      if (!key && (key === undefined || key === null)) {
        key = pos;
      }
      if (!keyEntities.get(key)) {
        warnOnlyTreeNode();
        return null;
      }
      return cloneElement(child, {
        eventKey: key,
        expanded: expandedKeys.indexOf(key) !== -1,
        selected: selectedKeys.indexOf(key) !== -1,
        loaded: loadedKeys.indexOf(key) !== -1,
        loading: loadingKeys.indexOf(key) !== -1,
        checked: isKeyChecked(key),
        halfChecked: halfCheckedKeys.indexOf(key) !== -1,
        pos,
        // [Legacy] Drag props
        dragOver: dragOverNodeKey === key && dropPosition === 0,
        dragOverGapTop: dragOverNodeKey === key && dropPosition === -1,
        dragOverGapBottom: dragOverNodeKey === key && dropPosition === 1,
        key
      });
    };


    return {
      getDerivedStateFromProps,
      onNodeDragStart,
      onNodeDragEnter,
      onNodeDragOver,
      onNodeDragLeave,
      onNodeDragEnd,
      onNodeDrop,
      onNodeClick,
      onNodeDoubleClick,
      onNodeSelect,
      onNodeCheck,
      onNodeLoad,
      onNodeExpand,
      onNodeMouseEnter,
      onNodeMouseLeave,
      onNodeContextMenu,
      setUncontrolledState,
      registerTreeNode,
      isKeyChecked,
      renderTreeNode,
      state: $state
    };
  },
  render() {
    const {_treeNode: treeNode} = this.state;
    const {prefixCls, focusable, showLine, tabIndex = 0} = this.$props;
    return (
        <ul
            class={classNames(prefixCls, {
              [`${prefixCls}-show-line`]: showLine
            })}
            role="tree"
            unselectable="on"
            tabindex={focusable ? tabIndex : null}>
          {mapChildren(unwrapFragment(treeNode), (node, index) => this.renderTreeNode(node, index))}
        </ul>
    );
  }
});
export default Tree;
