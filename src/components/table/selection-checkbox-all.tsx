import classNames from 'classnames';
import {defineComponent, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue';
import Checkbox from '../checkbox';
import Dropdown from '../dropdown';
import Icon from '../icon';
import Menu from '../menu';
import {SelectionCheckboxAllProps} from './interface';

function checkSelection({
                          store,
                          getCheckboxPropsByItem,
                          getRecordKey,
                          data,
                          type,
                          byDefaultChecked
                        }) {
  return byDefaultChecked
      ? data[type]((item, i) => getCheckboxPropsByItem(item, i).defaultChecked)
      : data[type]((item, i) => store.getState().selectedRowKeys.indexOf(getRecordKey(item, i)) >= 0);
}

function getIndeterminateState(props) {
  const {store, data} = props;
  if (!data.length) {
    return false;
  }

  const someCheckedNotByDefaultChecked =
      checkSelection({
        ...props,
        data,
        type: 'some',
        byDefaultChecked: false
      }) &&
      !checkSelection({
        ...props,
        data,
        type: 'every',
        byDefaultChecked: false
      });
  const someCheckedByDefaultChecked =
      checkSelection({
        ...props,
        data,
        type: 'some',
        byDefaultChecked: true
      }) &&
      !checkSelection({
        ...props,
        data,
        type: 'every',
        byDefaultChecked: true
      });

  if (store.getState().selectionDirty) {
    return someCheckedNotByDefaultChecked;
  }
  return someCheckedNotByDefaultChecked || someCheckedByDefaultChecked;
}

function getCheckState(props) {
  const {store, data} = props;
  if (!data.length) {
    return false;
  }
  if (store.getState().selectionDirty) {
    return checkSelection({
      ...props,
      data,
      type: 'every',
      byDefaultChecked: false
    });
  }
  return (
      checkSelection({
        ...props,
        data,
        type: 'every',
        byDefaultChecked: false
      }) ||
      checkSelection({
        ...props,
        data,
        type: 'every',
        byDefaultChecked: true
      })
  );
}
const MenuItem = Menu.Item;

export default defineComponent({
  name: 'SelectionCheckboxAll',
  props: SelectionCheckboxAllProps,
  setup(props, {emit}) {
    const defaultSelections = ref(props.hideDefaultSelections
        ? []
        : [
          {
            key: 'all',
            text: props.locale.selectAll
          },
          {
            key: 'invert',
            text: props.locale.selectInvert
          }
        ]);
    const indeterminate = ref(getIndeterminateState(props));
    const checked = ref(getCheckState(props));
    const setCheckState = () => {
      indeterminate.value = getIndeterminateState(props);
      checked.value = getCheckState(props);
    };
    const handleSelectAllChange = (e) => {
      const {checked} = e.target;
      emit('select', checked ? 'all' : 'removeAll', 0, null);
    };
    const renderMenus = (selections) => {
      return selections.map((selection, index) => {
        return (
            <MenuItem key={selection.key || index}>
              <div
                  onClick={() => {
                    emit('select', selection.key, index, selection.onSelect);
                  }}>
                {selection.text}
              </div>
            </MenuItem>
        );
      });
    };
    onUpdated(() => {
      setCheckState();
    });
    return {
      checked,
      indeterminate,
      defaultSelections,
      setCheckState,
      handleSelectAllChange,
      renderMenus
    };
  },
  render(ctx) {
    const {disabled, prefixCls, selections, getPopupContainer, checked, indeterminate} = this;

    const selectionPrefixCls = `${prefixCls}-selection`;

    let customSelections = null;

    if (selections) {
      const newSelections = Array.isArray(selections)
          ? ctx.defaultSelections.concat(selections)
          : ctx.defaultSelections;

      const menu = (
          <Menu class={`${selectionPrefixCls}-menu`} selectedKeys={[]}>
            {this.renderMenus(newSelections)}
          </Menu>
      );

      customSelections =
          newSelections.length > 0 ? (
              <Dropdown getPopupContainer={getPopupContainer}>
                <template slot="overlay">{menu}</template>
                <div class={`${selectionPrefixCls}-down`}>
                  <Icon type="down"/>
                </div>
              </Dropdown>
          ) : null;
    }

    return (
        <div class={selectionPrefixCls}>
          <Checkbox
              class={classNames({[`${selectionPrefixCls}-select-all-custom`]: customSelections})}
              checked={checked}
              indeterminate={indeterminate}
              disabled={disabled}
              onChange={this.handleSelectAllChange}
          />
          {customSelections}
        </div>
    );
  }
}) as any;
