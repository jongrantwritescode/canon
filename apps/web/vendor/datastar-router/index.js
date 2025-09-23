export function createRouter(config = {}) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.info('[DataStar Router] createRouter called', config);
  }

  return {
    config,
  };
}

export default {
  createRouter,
};
