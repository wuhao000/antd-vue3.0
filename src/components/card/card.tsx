import omit from 'omit.js';
import {defineComponent, getCurrentInstance} from 'vue';
import {filterEmpty, getComponentFromProp, getListenersFromInstance, getSlotOptions} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import Col from '../grid/col';
import Row from '../grid/row';
import Tabs from '../tabs';

const {TabPane} = Tabs;

export default defineComponent({
  name: 'ACard',
  props: {
    prefixCls: PropTypes.string,
    title: PropTypes.any,
    extra: PropTypes.any,
    bordered: PropTypes.bool.def(true),
    bodyStyle: PropTypes.object,
    headStyle: PropTypes.object,
    loading: PropTypes.bool.def(false),
    hoverable: PropTypes.bool.def(false),
    type: PropTypes.string,
    size: PropTypes.oneOf(['default', 'small']),
    actions: PropTypes.any,
    tabList: PropTypes.array,
    tabBarExtraContent: PropTypes.any,
    activeTabKey: PropTypes.string,
    defaultActiveTabKey: PropTypes.string
  },
  data() {
    return {
      widerPadding: false
    };
  },
  setup(props, {emit}) {
    const getAction = (actions) => {
      const actionList = actions.map((action, index) => (
          <li style={{width: `${100 / actions.length}%`}} key={`action-${index}`}>
            <span>{action}</span>
          </li>
      ));
      return actionList;
    };
    const onTabChange = (key) => {
      emit('tabChange', key);
    };
    const isContainGrid = (obj = []) => {
      let containGrid = undefined;
      obj.forEach(element => {
        if (element && getSlotOptions(element).__ANT_CARD_GRID) {
          containGrid = true;
        }
      });
      return containGrid;
    };

    return {
      getAction,
      onTabChange,
      isContainGrid,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      prefixCls: customizePrefixCls,
      headStyle = {},
      bodyStyle = {},
      loading,
      bordered = true,
      size = 'default',
      type,
      tabList,
      hoverable,
      activeTabKey,
      defaultActiveTabKey
    } = ctx.$props;

    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('card', customizePrefixCls);

    const tabBarExtraContent = getComponentFromProp(instance, 'tabBarExtraContent');
    const classString = {
      [`${prefixCls}`]: true,
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-hoverable`]: !!hoverable,
      [`${prefixCls}-contain-grid`]: ctx.isContainGrid(this.$slots.default()),
      [`${prefixCls}-contain-tabs`]: tabList && tabList.length,
      [`${prefixCls}-${size}`]: size !== 'default',
      [`${prefixCls}-type-${type}`]: !!type
    };

    const loadingBlockStyle =
        bodyStyle.padding === 0 || bodyStyle.padding === '0px' ? {padding: 24} : undefined;

    const loadingBlock = (
        <div class={`${prefixCls}-loading-content`} style={loadingBlockStyle}>
          <Row gutter={8}>
            <Col span={22}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
            <Col span={15}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
            <Col span={18}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={13}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
            <Col span={9}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
            <Col span={3}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
            <Col span={16}>
              <div class={`${prefixCls}-loading-block`}/>
            </Col>
          </Row>
        </div>
    );

    const hasActiveTabKey = activeTabKey !== undefined;
    const tabsProps = {
      size: 'large',
      [hasActiveTabKey ? 'activeKey' : 'defaultActiveKey']: hasActiveTabKey
          ? activeTabKey
          : defaultActiveTabKey,
      tabBarExtraContent,
      onChange: ctx.onTabChange,
      class: `${prefixCls}-head-tabs`
    };

    let head;
    const tabs =
        tabList && tabList.length ? (
            <Tabs {...tabsProps}>
              {tabList.map(item => {
                const {tab: temp, scopedSlots = {}} = item;
                const name = scopedSlots.tab;
                const tab =
                    temp !== undefined ? temp : ctx.$slots[name] ? ctx.$slots[name](item) : null;
                return <TabPane tab={tab} key={item.key} disabled={item.disabled}/>;
              })}
            </Tabs>
        ) : null;
    const titleDom = getComponentFromProp(instance, 'title');
    const extraDom = getComponentFromProp(instance, 'extra');
    if (titleDom || extraDom || tabs) {
      head = (
          <div class={`${prefixCls}-head`} style={headStyle}>
            <div class={`${prefixCls}-head-wrapper`}>
              {titleDom && <div class={`${prefixCls}-head-title`}>{titleDom}</div>}
              {extraDom && <div class={`${prefixCls}-extra`}>{extraDom}</div>}
            </div>
            {tabs}
          </div>
      );
    }

    const children = ctx.$slots.default();
    const cover = getComponentFromProp(instance, 'cover');
    const coverDom = cover ? <div class={`${prefixCls}-cover`}>{cover}</div> : null;
    const body = (
        <div class={`${prefixCls}-body`} style={bodyStyle}>
          {loading ? loadingBlock : children}
        </div>
    );
    const actions = filterEmpty(ctx.$slots.actions);
    const actionDom =
        actions && actions.length ? (
            <ul class={`${prefixCls}-actions`}>{ctx.getAction(actions)}</ul>
        ) : null;

    return (
        <div
            class={classString}
            ref="cardContainerRef"
            {...omit(getListenersFromInstance(instance), ['tabChange', 'tab-change'])}
        >
          {head}
          {coverDom}
          {children ? body : null}
          {actionDom}
        </div>
    );
  }
}) as any;
