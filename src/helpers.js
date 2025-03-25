const PLACEHOLDER_START = "{{";
const PLACEHOLDER_END = "}}";
const PLACEHOLDER_START_TEMP = "~~";
const PLACEHOLDER_END_TEMP = "~~";

export function replacePlaceholders(object, values) {
  if (!object || !values) {
    return object;
  }

  if (typeof object === "string") {
    let result = object;
    let start = result.indexOf(PLACEHOLDER_START);

    while (start >= 0) {
      let end = result.indexOf(
        PLACEHOLDER_END,
        start + PLACEHOLDER_START.length,
      );
      if (end === -1) {
        break;
      }

      const attribute = result.substring(start + PLACEHOLDER_START.length, end);

      if (attribute.startsWith("e!")) {
        try {
          const fn = attribute.substring(2);
          const [k, v] = getKeysValues(values);
          /* eslint-disable-next-line */
          const fnResult = new Function(...k, fn)(...v);
          if (
            typeof value !== "string" &&
            object === `${PLACEHOLDER_START}${attribute}${PLACEHOLDER_END}`
          ) {
            return fnResult;
          }

          result = result.replace(
            `${PLACEHOLDER_START}${attribute}${PLACEHOLDER_END}`,
            `${fnResult}`,
          );
        } catch (e) {
          console.error("fnError", e);
          result = result.replace(PLACEHOLDER_START, PLACEHOLDER_START_TEMP);
          result = result.replace(PLACEHOLDER_END, PLACEHOLDER_END_TEMP);
        }
      } else if (attribute in values) {
        const value = values[attribute];

        if (
          typeof value !== "string" &&
          object === `${PLACEHOLDER_START}${attribute}${PLACEHOLDER_END}`
        ) {
          return value;
        }

        result = result.replace(
          `${PLACEHOLDER_START}${attribute}${PLACEHOLDER_END}`,
          `${value}`,
        );
      } else {
        result = result.replace(PLACEHOLDER_START, PLACEHOLDER_START_TEMP);
        result = result.replace(PLACEHOLDER_END, PLACEHOLDER_END_TEMP);
      }

      start = result.indexOf(PLACEHOLDER_START);
    }

    result = result.replace(PLACEHOLDER_START_TEMP, PLACEHOLDER_START);
    result = result.replace(PLACEHOLDER_END_TEMP, PLACEHOLDER_END);

    return result;
  } else if (Array.isArray(object)) {
    const result = [];
    for (let item of object) {
      result.push(replacePlaceholders(item, values));
    }

    return result;
  } else if (typeof object === "object") {
    const result = {};
    for (let key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        result[key] = replacePlaceholders(object[key], values);
      }
    }

    return result;
  }

  return object;
}

const eventList = [
  "onClick",
  "onContextMenu",
  "onSelect",
  "onChange",
  "onSubmit",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "onKeyPress",
  "onKeyUp",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  "onScroll",
  "onLoad",
  "onError",
  "onFinish",
  "onConfirm",
  "onOk",
  "onCancel",
  "onSave",
  "onClear",
];

export function getKeysValues(obj) {
  const keys = [];
  const values = [];

  Object.entries(obj || {}).forEach(([key, value]) => {
    keys.push(key);
    values.push(value);
  });

  return [keys, values];
}

export function bindEvents(obj, vars = {}) {
  if (!obj) {
    return obj;
  }

  const result = { ...obj };

  for (let event of eventList) {
    if (event in obj) {
      result[event] = (e) => {
        const { fn, args = {} } = obj[event];
        const _args = { ...vars, ...args, e };
        const [keys, values] = getKeysValues(_args);

        /* eslint-disable-next-line */
        return new Function(...keys, fn)(...values);
      };
    }
  }

  return result;
}

export function bindFunction(config, vars, argKeys = []) {
  const fn = config?.fn;
  if (!fn) {
    return;
  }

  const args = config?.args || {};

  return (...argValues) => {
    const [keys, values] = getKeysValues({ ...vars, ...args });

    keys.push(...argKeys);
    values.push(...argValues);

    /* eslint-disable-next-line */
    return new Function(...keys, fn)(...values);
  };
}

export function callFunction(config, vars, argKeys = []) {
  const fn = bindFunction(config, vars, argKeys);
  if (typeof fn !== "function") {
    return;
  }

  return fn();
}
