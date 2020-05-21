import Vue from 'vue';

declare global {
  export interface Window {
    AntDesignIcons: any;
    moment: any;
  }
}

declare module 'async-validator' {
  interface RuleItem {
    trigger: 'blur' | 'change';
  }
}
