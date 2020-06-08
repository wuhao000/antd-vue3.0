import {Component} from './components';

const fs = require('fs');
const components = require('./components');
const renderTemplate = require('./tmpl').render;

const str = `[${components.map((component: Component) => {
  return `{
  path: '${component.id}',
  name: '${component.name} ${component.zhName}',
  component: () => import('../views/demo/${component.id}/index.vue'),
  meta: {
    tag: '${component.tag}'
  }
}`;
}).join(', ')}]`;
const res = renderTemplate('build/templates/router.ts.tmpl', {
  str
});
fs.writeFileSync('src/router/components.ts', res);

export {}
