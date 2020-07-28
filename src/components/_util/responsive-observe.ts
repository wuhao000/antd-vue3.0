// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82

export const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export const responsiveMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)'
};

let subscribers = [];
let subUid = -1;
let screens = {};

const responsiveObserve = {
  dispatch(pointMap) {
    screens = pointMap;
    if (subscribers.length < 1) {
      return false;
    }

    subscribers.forEach(item => {
      item.func(screens);
    });

    return true;
  },
  subscribe(func) {
    const token = (++subUid).toString();
    subscribers.push({
      token,
      func
    });
    func(screens);
    return token;
  },
  unsubscribe(token) {
    subscribers = subscribers.filter(item => item.token !== token);
  }
};

export default responsiveObserve;
