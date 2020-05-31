import AIcon from '@/components/icon';
import AInput from '@/components/input';
import {defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'ExpandableCell',
  props: {
    text: String
  },
  setup($props, {emit}) {
    const value = ref($props.text);
    const editable = ref(false);
    const handleChange = (e, v) => {
      if (v !== undefined) {
        value.value = v;
      }
    };
    const check = () => {
      editable.value = false;
      console.log('check');
      console.log('text: ' + $props.text);
      console.log('value: ' + value.value);
      emit('change', value);
    };
    const edit = () => {
      editable.value = true;
    };
    return {
      value,
      editable,
      handleChange,
      check,
      edit
    };
  },
  render() {
    return <div class="editable-cell">
      {
        this.editable ? <div class="editable-cell-input-wrapper">
              <AInput value={this.value} onChange={this.handleChange}
                      onPressEnter={this.check}/>
              <AIcon
                  type="check"
                  class="editable-cell-icon-check"
                  onClick={this.check}/>
            </div> :
            <div class="editable-cell-text-wrapper">
              {this.value || ''}
              <AIcon type="edit" class="editable-cell-icon" onClick={this.edit}/>
            </div>
      }
    </div>;
  }
});
