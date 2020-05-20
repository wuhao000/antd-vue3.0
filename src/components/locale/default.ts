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
  Empty: { description: string };
  Icon: LocaleIcon;
  Modal: { cancelText: string; justOkText: string; okText: string }
  PageHeader: { back: string };
  Pagination: any;
  Popconfirm: { cancelText: string; okText: string };
  Table: { sortTitle: string; filterReset: string; selectAll: string; expand: string; selectInvert: string; filterTitle: string; filterConfirm: string; collapse: string };
  Text: { expand: string; copied: string; edit: string; copy: string };
  TimePicker: any;
  Transfer: { searchPlaceholder: string; itemUnit: string; itemsUnit: string; titles: string[] };
  Upload: { downloadFile: string; removeFile: string; previewFile: string; uploading: string; uploadError: string };
  global: { placeholder: string };
  locale: string;
}

let local: Locale = {
  locale: 'en',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global: {
    placeholder: 'Please select'
  },
  Table: {
    filterTitle: 'Filter menu',
    filterConfirm: 'OK',
    filterReset: 'Reset',
    selectAll: 'Select current page',
    selectInvert: 'Invert current page',
    sortTitle: 'Sort',
    expand: 'Expand row',
    collapse: 'Collapse row'
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Cancel',
    justOkText: 'OK'
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Cancel'
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Search here',
    itemUnit: 'item',
    itemsUnit: 'items'
  },
  Upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    downloadFile: 'Download file'
  },
  Empty: {
    description: 'No Data'
  },
  Icon: {
    icon: 'icon'
  },
  Text: {
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand'
  },
  PageHeader: {
    back: 'Back'
  }
};
export default local;
