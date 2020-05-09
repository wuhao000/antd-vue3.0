import {App} from 'vue';

export function antDecorator(app: App) {
  return app.directive('decorator', {});
}

export default {
  // just for tag
  install: (app: App) => {
    antDecorator(app);
  }
};
