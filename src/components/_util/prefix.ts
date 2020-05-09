export const getPrefixCls = (cls: string, prefix: string) => {
  if (prefix) {
    return prefix + cls;
  }
  return 'ant-' + cls;
};
