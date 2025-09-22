export function createStore(initialState = {}) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.info('[DataStar Store] createStore called', initialState);
  }

  let state = { ...initialState };

  return {
    getState() {
      return state;
    },
    setState(nextState = {}) {
      state = { ...state, ...nextState };
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.info('[DataStar Store] state updated', state);
      }
    },
  };
}

export default {
  createStore,
};
