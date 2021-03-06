import * as moment from 'moment';
import {App, defineComponent, getCurrentInstance, onUnmounted, provide, ref, watch} from 'vue';
import interopDefault from '../_util/interop-default';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import Base from '../base';
import {changeConfirmLocale} from '../modal/locale';
// export interface Locale {
//   locale: string;
//   Pagination?: Object;
//   DatePicker?: Object;
//   TimePicker?: Object;
//   Calendar?: Object;
//   Table?: Object;
//   Modal?: ModalLocale;
//   Popconfirm?: Object;
//   Transfer?: Object;
//   Select?: Object;
//   Upload?: Object;
// }
export const ANT_MARK = 'internalMark';

function setMomentLocale(locale) {
  if (locale && locale.locale) {
    interopDefault(moment).locale(locale.locale);
  } else {
    interopDefault(moment).locale('en');
  }
}

const COMPONENT_NAME = 'ALocaleProvider';
const LocaleProvider: any = defineComponent({
  name: COMPONENT_NAME,
  props: {
    locale: PropTypes.object.def(() => ({})),
    _ANT_MARK__: PropTypes.string
  },
  setup(props) {
    warning(props._ANT_MARK__ === ANT_MARK, 'LocaleProvider', '`LocaleProvider` is deprecated. Please use `locale`' +
        ' with `ConfigProvider` instead');
    const {data} = getCurrentInstance();
    provide('localeData', data);
    const antLocale = ref({
      ...props.locale,
      exist: true
    });
    watch(props.locale, (val) => {
      antLocale.value = {
        ...props.locale,
        exist: true
      };
      setMomentLocale(val);
      changeConfirmLocale(val && val.Modal);
    });
    setMomentLocale(props.locale);
    changeConfirmLocale(props.locale && props.locale.Modal);
    onUnmounted(() => {
      changeConfirmLocale();
    });
    return {
      antLocale
    };
  },
  render() {
    return this.$slots.default ? this.$slots.default[0] : null;
  }
}) && {
  install: ((app: App) => {
  })
};

/* istanbul ignore next */
LocaleProvider.install = function(app: App) {
  app.use(Base);
  app.component(COMPONENT_NAME, LocaleProvider);
};

export default LocaleProvider;
