export const getClientInfo = (el: HTMLElement | Element) => {
  return {
    x: el.getBoundingClientRect().x,
    y: el.getBoundingClientRect().y,
    width: el.getBoundingClientRect().width,
    height: el.getBoundingClientRect().height,
  };
};
