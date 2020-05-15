const fs = require('fs');
const path = require('path');

const dirs = fs.readdirSync('../src/views/demo')
    .filter(it => !it.includes('.'));

const str = `[${dirs.map(name => {
  return `{
  path: '${name}',
  name: '${name}',
  component: () => import('../views/demo/${name}/index.vue')
}`;
}).join(', ')}]`;

fs.writeFileSync('../src/router/components.ts', `export default ${str};`);
