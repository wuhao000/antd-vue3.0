import {getCurrentInstance} from '@vue/runtime-core';
import classNames from 'classnames';
import {ComponentOptionsWithObjectProps, defineComponent, nextTick, onMounted, ref, watch} from 'vue';
import BaseMixin from '../../_util/base-mixin';
import {getAttrs, getOptionProps, initDefaultProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import DataEntryFocus from '../../input/data-entry-focus';

export default defineComponent({
  name: 'Checkbox',
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: initDefaultProps(
      {
        prefixCls: PropTypes.string,
        name: PropTypes.string,
        id: PropTypes.string,
        type: PropTypes.string,
        defaultChecked: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
        checked: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
        disabled: PropTypes.bool,
        // onFocus: PropTypes.func,
        // onBlur: PropTypes.func,
        // onChange: PropTypes.func,
        // onClick: PropTypes.func,
        tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        readOnly: PropTypes.bool,
        autoFocus: PropTypes.bool,
        value: PropTypes.any
      },
      {
        prefixCls: 'rc-checkbox',
        type: 'checkbox',
        defaultChecked: false
      }
  ),
  setup(props) {
    const sChecked = ref(props.checked !== undefined ? props.checked : props.defaultChecked);
    const componentInstance = getCurrentInstance();
    watch(() => props.checked, (val) => {
      sChecked.value = val;
    });
    const {__emit} = BaseMixin(componentInstance);
    const eventShiftKey = ref(false);
    const {setEl, getEl, focus, blur} = DataEntryFocus();
    onMounted(() => {
      nextTick(() => {
        if (props.autoFocus) {
          getEl()?.focus();
        }
      });
    });
    const handleChange = (e) => {
      if (props.disabled) {
        return;
      }
      if (props.checked === undefined) {
        sChecked.value = e.target.checked;
      }
      e.shiftKey = eventShiftKey.value;
      __emit('change', {
        target: {
          ...props,
          checked: e.target.checked
        },
        stopPropagation() {
          e.stopPropagation();
        },
        preventDefault() {
          e.preventDefault();
        },
        nativeEvent: e
      });
      eventShiftKey.value = false;
    };
    const onClick = (e) => {
      __emit('click', e);
      // onChange没能获取到shiftKey，使用onClick hack
      eventShiftKey.value = e.shiftKey;
    };
    return {
      sChecked, focus, blur, setEl, onClick, handleChange
    };
  },
  render() {
    const {
      prefixCls,
      name,
      id,
      type,
      disabled,
      readOnly,
      tabIndex,
      autoFocus,
      value,
      ...others
    } = getOptionProps(this);
    const attrs = this.$attrs;
    const globalProps = Object.keys({...others, ...attrs}).reduce((prev, key) => {
      if (key.substr(0, 5) === 'aria-' || key.substr(0, 5) === 'data-' || key === 'role') {
        prev[key] = others[key];
      }
      return prev;
    }, {});

    const {sChecked} = this;
    const classString = classNames(prefixCls, attrs.class, {
      [`${prefixCls}-checked`]: sChecked,
      [`${prefixCls}-disabled`]: disabled
    });
    return (
        <span class={classString}>
          {
            // @ts-ignore
            <input onChange={this.handleChange} onClick={this.onClick}
                   name={name}
                   id={id}
                   type={type}
                   readonly={readOnly}
                   disabled={disabled}
                   tabindex={tabIndex}
                   class={`${prefixCls}-input`}
                   checked={!!sChecked}
                   autofocus={autoFocus}
                   ref="input"
                   value={value}
                   {...globalProps}/>
          }
          <span class={`${prefixCls}-inner`}/>
        </span>
    );
  }
} as ComponentOptionsWithObjectProps);
