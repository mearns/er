import { hasStack } from "./type-utils";

type WithoutCause<C extends Error> = Omit<C, "cause" | "causeChain">;

type CauseChain<C extends Error> = C extends { causeChain: Array<Error> } & {
  causeChain: infer CC;
}
  ? CC
  : [];

type ExtendedCauseChain<C extends Error> = [WithoutCause<C>, ...CauseChain<C>];

/**
 * An error that is caused by another error.
 */
export interface ErrorWithCause<C extends Error = Error> extends Error {
  /**
   * The cause of this error.
   */
  cause: WithoutCause<C>;
  causeChain: ExtendedCauseChain<C>;
}

function hasCause(error: Error): error is ErrorWithCause {
  return (
    Object.hasOwnProperty.call(error, "causeChain") &&
    Object.hasOwnProperty.call(error, "cause") &&
    Array.isArray((error as Error & { causeChain: unknown }).causeChain) &&
    (error as ErrorWithCause).causeChain.every((e) => e instanceof Error) &&
    (error as ErrorWithCause).cause instanceof Error
  );
}

/**
 * Modify the given `self` error in place to indicate that it was caused by the given `cause` error.
 * This properly sets the `cause` and `causeChain` properties from the `ErrorWithCause` interface.
 */
export function setErrorCause<E extends Error = Error, C extends Error = Error>(
  self: E,
  cause: C
): ErrorWithCause<C> & C & E {
  const scrubbedCause = hideCause(cause);
  const withCause = Object.assign(self, {
    cause: scrubbedCause,
    causeChain: [scrubbedCause, ...(hasCause(cause) ? cause.causeChain : [])],
  });

  Object.keys(cause).forEach((key) => {
    if (!Object.hasOwnProperty.call(withCause, key)) {
      Object.defineProperty(withCause, key, {
        get: () => cause[key],
        enumerable: true,
      });
    }
  });

  if (hasStack(cause)) {
    withCause.stack = `${withCause.stack ?? ""}\n  caused by ${cause.stack}`;
  } else {
    withCause.stack = `${withCause.stack ?? ""}\n  caused by ${cause.name}: ${
      cause.message
    }`;
  }

  return withCause as ErrorWithCause<C> & C & E;
}

/**
 * Creates an object which looks and behaves identically to the given error, except that it's cause and causeChain
 * properties are hidden.
 */
function hideCause<E extends Error = Error>(
  error: E
): Omit<E, "cause" | "causeChain"> {
  return new Proxy(error, {
    getOwnPropertyDescriptor(target, key) {
      if (key === "cause" || key === "causeChain") {
        return undefined;
      }
      if (key === "stack" || key === "message" || key === "name") {
        return {
          ...Reflect.getOwnPropertyDescriptor(target, key),
          enumerable: true,
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, key);
    },

    has(target, key) {
      return (
        key === "name" ||
        key === "message" ||
        key === "stack" ||
        (key !== "cause" && key !== "causeChain" && Reflect.has(target, key))
      );
    },

    ownKeys(target) {
      return [
        "name",
        "message",
        "stack",
        ...Reflect.ownKeys(target).filter(
          (key) =>
            key !== "cause" &&
            key !== "causeChain" &&
            key !== "stack" &&
            key !== "message" &&
            key !== "name"
        ),
      ];
    },
  });
}
