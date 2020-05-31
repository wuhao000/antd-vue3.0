export {default as Provider} from './provider';

export {default as connect} from './connect';

export {default as create} from './create';


export interface Store<T extends object = any> {
  setState: (state: T) => never;
  getState: () => T;
}
