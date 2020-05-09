import {App} from 'vue';
import Col from './col';
import Row from './row';

export default {
  install: (app: App) => {
    app.component(Row.name, Row);
    app.component(Col.name, Col);
  }
};
export {Row, Col};
