export function on(signal, transform) {
  return function (event) {
    if (!event || !event.target || !('value' in event.target)) {
      return;
    }

    let nextValue = event.target.value;

    if (typeof transform === "function") {
      nextValue = transform(nextValue);
    }

    if (typeof signal === "function") {
      signal(nextValue);
    } else if (signal && "value" in signal) {
      signal.value = nextValue;
    }
  };
}
