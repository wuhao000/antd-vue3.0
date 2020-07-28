import classNames from 'classnames';
import {defineComponent} from 'vue';
import PropTypes from '../_util/vue-types';

export default defineComponent({
  name: 'Pager',
  props: {
    rootPrefixCls: PropTypes.string,
    page: PropTypes.number,
    active: PropTypes.bool,
    last: PropTypes.bool,
    locale: PropTypes.object,
    showTitle: PropTypes.bool,
    itemRender: {
      type: Function,
      default: () => {
      }
    }
  },
  setup(props, {emit}) {
    const handleClick = () => {
      emit('click', props.page);
    };
    const handleKeyPress = (event) => {
      emit('keypress', event, handleClick, props.page);
    };
    return {
      handleClick,
      handleKeyPress
    };
  },
  render(ctx) {
    const props = this.$props;
    const prefixCls = `${props.rootPrefixCls}-item`;
    const cls = classNames(prefixCls, `${prefixCls}-${props.page}`, {
      [`${prefixCls}-active`]: props.active,
      [`${prefixCls}-disabled`]: !props.page
    });

    return (
        <li
            class={cls}
            onClick={this.handleClick}
            onKeypress={this.handleKeyPress}
            title={this.showTitle ? this.page : null}
            tabindex={0}
        >
          {ctx.itemRender(this.page, 'page', <a>{this.page}</a>)}
        </li>
    );
  }
}) as any;
