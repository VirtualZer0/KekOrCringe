export const spawnFadeout = (
  target: HTMLElement,
  type: 'div' | 'img' = 'div',
  content = ''
) => {
  const fadeoutElement = document.createElement(type);

  if (type == 'div') {
    fadeoutElement.innerText = content;
  } else {
    (fadeoutElement as HTMLImageElement).src = content;
  }

  fadeoutElement.style.left = target.offsetLeft + target.clientWidth / 2 + 'px';
  fadeoutElement.classList.add('fadeout-el');
  target.insertAdjacentElement('afterend', fadeoutElement);

  setTimeout(() => fadeoutElement.remove(), 750);

  return fadeoutElement;
};
