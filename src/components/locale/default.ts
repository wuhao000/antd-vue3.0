import Calendar from '../calendar/locale/zh_CN';
import DatePicker from '../date-picker/locale/zh_CN';
import TimePicker from '../time-picker/locale/zh_CN';
import Pagination from '../vc-pagination/locale/zh_CN';

export interface LocaleIcon {
  icon: string
}

export interface Locale {
  Calendar: any;
  DatePicker: any;
  Empty: {
    description: string
  };
  Icon: LocaleIcon;
  Modal: {
    cancelText: string;
    justOkText: string;
    okText: string
  }
  PageHeader: {
    back: string
  };
  Pagination: any;
  Popconfirm: {
    cancelText: string;
    okText: string
  };
  Table: {
    sortTitle: string;
    filterReset: string;
    selectAll: string;
    expand: string;
    selectInvert: string;
    filterTitle: string;
    filterConfirm: string;
    collapse: string
  };
  Text: {
    expand: string;
    copied: string;
    edit: string;
    copy: string
  };
  TimePicker: any;
  Transfer: {
    searchPlaceholder: string;
    itemUnit: string;
    itemsUnit: string;
    titles: string[]
  };
  Upload: {
    downloadFile: string;
    removeFile: string;
    previewFile: string;
    uploading: string;
    uploadError: string
  };
  global: {
    placeholder: string
  };
  locale: string;
}

const local: Locale = {
  locale: 'en',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: '请选择'
  },
  Table: {
    filterTitle: '筛选',
    filterConfirm: '确定',
    filterReset: '重置',
    selectAll: '全选当页',
    selectInvert: '反选当页',
    sortTitle: '排序',
    expand: '展开行',
    collapse: '关闭行'
  },
  Modal: {
    okText: '确定',
    cancelText: '取消',
    justOkText: '知道了'
  },
  Popconfirm: {
    cancelText: '取消',
    okText: '确定'
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: '请输入搜索内容',
    itemUnit: '项',
    itemsUnit: '项'
  },
  Upload: {
    uploading: '文件上传中',
    removeFile: '删除文件',
    uploadError: '上传错误',
    previewFile: '预览文件',
    downloadFile: '下载文件'
  },
  Empty: {
    description: '暂无数据'
  },
  Icon: {
    icon: '图标'
  },
  Text: {
    edit: '编辑',
    copy: '复制',
    copied: '复制成功',
    expand: '展开'
  },
  PageHeader: {
    back: '返回'
  }
};
export default local;
