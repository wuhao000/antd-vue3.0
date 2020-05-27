import {useLocalValue} from '@/tools/value';
import PropTypes from '../../_util/vue-types';
import { getComponentFromProp } from '../../_util/props-util';
import Sentinel from './sentinel';

import {ref, defineComponent, getCurrentInstance} from 'vue';
import { useSentinelContext } from './tabs';

export default defineComponent({
  name: 'TabPane',
  props: {
    active: PropTypes.bool,
    destroyInactiveTabPane: PropTypes.bool,
    forceRender: PropTypes.bool,
    placeholder: PropTypes.any,
    rootPrefixCls: PropTypes.string,
    tab: PropTypes.any,
    closable: PropTypes.bool,
    disabled: PropTypes.bool
  },
  setup(props, {emit}) {
    const {value: active, setValue: setActive} = useLocalValue(false, 'active');
    return {
      active,
      setActive,
      sentinelContext: useSentinelContext()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {destroyInactiveTabPane, active, forceRender, rootPrefixCls} = ctx.$props;
    const children = ctx.$slots.default();
    const placeholder = getComponentFromProp(instance, 'placeholder');
    const prefixCls = `${rootPrefixCls}-tabpane`;
    const cls = {
      [prefixCls]: 1,
      [`${prefixCls}-inactive`]: !active,
      [`${prefixCls}-active`]: active
    };
    const isRender = destroyInactiveTabPane ? active : this.active;
    const shouldRender = isRender || forceRender;
    const {
      sentinelStart,
      sentinelEnd,
      setPanelSentinelStart,
      setPanelSentinelEnd
    } = this.sentinelContext;
    let panelSentinelStart;
    let panelSentinelEnd;
    if (active && shouldRender) {
      panelSentinelStart = <Sentinel setRef={setPanelSentinelStart} prevElement={sentinelStart}/>;
      panelSentinelEnd = <Sentinel setRef={setPanelSentinelEnd} nextElement={sentinelEnd}/>;
    }
    return (
        <div class={cls} role="tabpanel" aria-hidden={active ? 'false' : 'true'}>
          {panelSentinelStart}
          {shouldRender ? children : placeholder}
          {panelSentinelEnd}
        </div>
    );
  }
});
