import {defineComponent} from 'vue';
import PropTypes from '../../_util/vue-types';

export default defineComponent({
  name: 'ExpandIcon',
  props: {
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    expandable: PropTypes.any,
    expanded: PropTypes.bool,
    needIndentSpaced: PropTypes.bool
  },
  setup($props, {emit}) {
    const onExpand = (e) => {
      emit('expand', $props.record, e);
    };
    return {
      onExpand
    };
  },
  render() {
    const {expandable, prefixCls, onExpand, needIndentSpaced, expanded} = this;
    if (expandable) {
      const expandClassName = expanded ? 'expanded' : 'collapsed';
      return (
          <span
              class={`${prefixCls}-expand-icon ${prefixCls}-${expandClassName}`}
              onClick={onExpand}
          />
      );
    }
    if (needIndentSpaced) {
      return <span class={`${prefixCls}-expand-icon ${prefixCls}-spaced`}/>;
    }
    return null;
  }
}) as any;
