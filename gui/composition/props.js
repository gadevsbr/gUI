export function mergeProps(...sources) {
  return new Proxy(
    {},
    {
      get(target, prop) {
        for (let i = sources.length - 1; i >= 0; i--) {
          const source = sources[i];
          if (source && prop in source) {
            return source[prop];
          }
        }
        return undefined;
      },
      has(target, prop) {
        for (let i = sources.length - 1; i >= 0; i--) {
          const source = sources[i];
          if (source && prop in source) {
            return true;
          }
        }
        return false;
      },
      ownKeys(target) {
        const keys = new Set();
        for (const source of sources) {
          if (source) {
            for (const key of Reflect.ownKeys(source)) {
              keys.add(key);
            }
          }
        }
        return Array.from(keys);
      },
      getOwnPropertyDescriptor(target, prop) {
        for (let i = sources.length - 1; i >= 0; i--) {
          const source = sources[i];
          if (source && prop in source) {
            return {
              enumerable: true,
              configurable: true,
              get() {
                return source[prop];
              },
            };
          }
        }
        return undefined;
      },
    }
  );
}

export function splitProps(props, ...keysets) {
  const sets = keysets.map((keys) => new Set(keys));
  const result = [];
  
  for (let i = 0; i < sets.length; i++) {
    const keys = sets[i];
    result.push(
      new Proxy(
        {},
        {
          get(target, prop) {
            return keys.has(prop) ? props[prop] : undefined;
          },
          has(target, prop) {
            return keys.has(prop) && prop in props;
          },
          ownKeys(target) {
            return Array.from(keys).filter((k) => k in props);
          },
          getOwnPropertyDescriptor(target, prop) {
            if (keys.has(prop) && prop in props) {
              return {
                enumerable: true,
                configurable: true,
                get() {
                  return props[prop];
                },
              };
            }
            return undefined;
          },
        }
      )
    );
  }

  result.push(
    new Proxy(
      {},
      {
        get(target, prop) {
          if (sets.some((s) => s.has(prop))) return undefined;
          return props[prop];
        },
        has(target, prop) {
          if (sets.some((s) => s.has(prop))) return false;
          return prop in props;
        },
        ownKeys(target) {
          return Reflect.ownKeys(props).filter((k) => !sets.some((s) => s.has(k)));
        },
        getOwnPropertyDescriptor(target, prop) {
          if (sets.some((s) => s.has(prop))) return undefined;
          if (prop in props) {
            return {
              enumerable: true,
              configurable: true,
              get() {
                return props[prop];
              },
            };
          }
          return undefined;
        },
      }
    )
  );

  return result;
}
