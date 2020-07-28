import Card from './card';
import Meta from './meta';
import Grid from './grid';
import Base from '../base';
Card.Meta = Meta;
Card.Grid = Grid;

/* istanbul ignore next */
Card.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Card.name, Card);
  Vue.component(Meta.name, Meta);
  Vue.component(Grid.name, Grid);
};

export default Card;
