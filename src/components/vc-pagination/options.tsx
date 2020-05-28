import {defineComponent, ref, Ref} from 'vue';
import PropTypes from '../_util/vue-types';
import KEYCODE from './keycode';

export default defineComponent({
  props: {
    disabled: PropTypes.bool,
    changeSize: PropTypes.func,
    quickGo: PropTypes.func,
    selectComponentClass: PropTypes.any,
    current: PropTypes.number,
    pageSizeOptions: PropTypes.array.def(['10', '20', '30', '40']),
    pageSize: PropTypes.number,
    buildOptionText: PropTypes.func,
    locale: PropTypes.object,
    rootPrefixCls: PropTypes.string,
    selectPrefixCls: PropTypes.string,
    goButton: PropTypes.any
  },
  setup(props) {
    const goInputText: Ref = ref('');
    const getValidValue = () => {
      const goInputTextV = goInputText.value;
      const {current} = props;
      return !goInputTextV || isNaN(goInputTextV) ? current : Number(goInputTextV);
    };
    const defaultBuildOptionText = (opt) => {
      return `${opt.value} ${props.locale.items_per_page}`;
    };
    const handleChange = (e) => {
      const {value, composing} = e.target;
      if (composing || goInputText === value) {
        return;
      }
      goInputText.value = value;
    };
    const handleBlur = (e) => {
      const {goButton, quickGo, rootPrefixCls} = props;
      if (goButton) {
        return;
      }
      if (
          e.relatedTarget &&
          (e.relatedTarget.className.indexOf(`${rootPrefixCls}-prev`) >= 0 ||
              e.relatedTarget.className.indexOf(`${rootPrefixCls}-next`) >= 0)
      ) {
        return;
      }
      quickGo(getValidValue());
    };
    const go = (e) => {
      if (goInputText.value === '') {
        return;
      }
      if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
        // https://github.com/vueComponent/ant-design-vue/issues/1316
        props.quickGo(getValidValue());
        goInputText.value = '';
      }
    };

    return {
      getValidValue,
      defaultBuildOptionText,
      handleChange,
      handleBlur,
      goInputText,
      go
    };
  },
  render() {
    const {
      rootPrefixCls,
      locale,
      changeSize,
      quickGo,
      goButton,
      selectComponentClass: Select,
      defaultBuildOptionText,
      selectPrefixCls,
      pageSize,
      pageSizeOptions,
      goInputText,
      disabled
    } = this;
    const prefixCls = `${rootPrefixCls}-options`;
    let changeSelect = null;
    let goInput = null;
    let gotoButton = null;

    if (!changeSize && !quickGo) {
      return null;
    }

    if (changeSize && Select) {
      const buildOptionText = this.buildOptionText || defaultBuildOptionText;
      const SelectOption = Select.Option;
      const options = pageSizeOptions.map((opt, i) => (
          <SelectOption key={i} value={opt}>
            {buildOptionText({value: opt})}
          </SelectOption>
      ));
      changeSelect = (
          <Select
              disabled={disabled}
              prefixCls={selectPrefixCls}
              showSearch={false}
              class={`${prefixCls}-size-changer`}
              optionLabelProp="children"
              dropdownMatchSelectWidth={false}
              value={(pageSize || pageSizeOptions[0]).toString()}
              onChange={value => this.changeSize(Number(value))}
              getPopupContainer={triggerNode => triggerNode.parentNode}>
            {options}
          </Select>
      );
    }

    if (quickGo) {
      if (goButton) {
        gotoButton =
            typeof goButton === 'boolean' ? (
                <button type="button" onClick={this.go} onKeyup={this.go} disabled={disabled}>
                  {locale.jump_to_confirm}
                </button>
            ) : (
                <span onClick={this.go} onKeyup={this.go}>
              {goButton}
            </span>
            );
      }
      goInput = (
          <div class={`${prefixCls}-quick-jumper`}>
            {locale.jump_to}
            <input
                disabled={disabled}
                type="text"
                value={goInputText}
                onInput={this.handleChange}
                onKeyup={this.go}
                onBlur={this.handleBlur}/>
            {locale.page}
            {gotoButton}
          </div>
      );
    }

    return (
        <li class={`${prefixCls}`}>
          {changeSelect}
          {goInput}
        </li>
    );
  }
}) as any;
