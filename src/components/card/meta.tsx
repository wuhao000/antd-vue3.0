import {defineComponent, getCurrentInstance} from 'vue';
import {getComponentFromProp, getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';

export default defineComponent({
  name: 'ACardMeta',
  props: {
    prefixCls: PropTypes.string,
    title: PropTypes.any,
    description: PropTypes.any
  },
  setup() {
    return {
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {prefixCls: customizePrefixCls} = ctx.$props;

    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('card', customizePrefixCls);

    const classString = {
      [`${prefixCls}-meta`]: true
    };

    const avatar = getComponentFromProp(instance, 'avatar');
    const title = getComponentFromProp(instance, 'title');
    const description = getComponentFromProp(instance, 'description');

    const avatarDom = avatar ? <div class={`${prefixCls}-meta-avatar`}>{avatar}</div> : null;
    const titleDom = title ? <div class={`${prefixCls}-meta-title`}>{title}</div> : null;
    const descriptionDom = description ? (
        <div class={`${prefixCls}-meta-description`}>{description}</div>
    ) : null;
    const MetaDetail =
        titleDom || descriptionDom ? (
            <div class={`${prefixCls}-meta-detail`}>
              {titleDom}
              {descriptionDom}
            </div>
        ) : null;
    return (
        <div {...getListenersFromInstance(instance)} class={classString}>
          {avatarDom}
          {MetaDetail}
        </div>
    );
  }
});
