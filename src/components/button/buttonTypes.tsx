import PropTypes from '../_util/vue-types';

export interface ButtonProps {
  prefixCls?: string;
  type?: string,
  htmlType?: 'button' | 'submit' | 'reset';
  icon?: string,
  shape?: 'circle' | 'circle-outline' | 'round';
  size?: 'small' | 'large' | 'default';
  loading?: boolean | object;
  disabled?: boolean;
  ghost?: boolean;
  block?: boolean;
}

export default {
  prefixCls: PropTypes.string,
  type: PropTypes.string,
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']).def('button'),
  icon: PropTypes.string,
  shape: PropTypes.oneOf(['circle', 'circle-outline', 'round']),
  size: PropTypes.oneOf(['small', 'large', 'default']).def('default'),
  loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  disabled: PropTypes.bool,
  ghost: PropTypes.bool,
  block: PropTypes.bool
};
