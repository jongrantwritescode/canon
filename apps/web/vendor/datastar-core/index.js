function log(method, config) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return;
  }

  console.info(`[DataStar Core] ${method} called`, config);
}

export function init(config = {}) {
  log('init', config);
}

export function initialize(config = {}) {
  log('initialize', config);
}

export function start(config = {}) {
  log('start', config);
}

export default {
  init,
  initialize,
  start,
};
