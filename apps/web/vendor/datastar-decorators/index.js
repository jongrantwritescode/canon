export function controller() {
  return function decorator(target, property, descriptor) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.info('[DataStar Decorators] controller applied', {
        target,
        property,
        descriptor,
      });
    }
    return descriptor;
  };
}

export default {
  controller,
};
