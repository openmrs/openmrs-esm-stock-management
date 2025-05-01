import '@testing-library/jest-dom';

// https://github.com/jsdom/jsdom/issues/1695
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.HTMLElement.prototype.scrollIntoView = function () {};
