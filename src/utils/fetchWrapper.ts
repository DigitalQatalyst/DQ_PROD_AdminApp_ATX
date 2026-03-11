// Only suppress console in production builds
if (typeof window !== 'undefined' && import.meta.env.MODE === 'production') {
  const noop = () => {};
  window.console.log = noop;
  window.console.error = noop;
  window.console.warn = noop;
  window.console.info = noop;
  window.console.debug = noop;
}

export {};
