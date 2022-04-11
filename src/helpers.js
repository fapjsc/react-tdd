export const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    return setTimeout(() => {
      resolve(true);
    }, time);
  });
};
