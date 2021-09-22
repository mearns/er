import { ErrorWithCause, setErrorCause } from "./cause";
import { createError, ErrorWithProps } from "./create";

type Props = Record<string | number | symbol, unknown>;
type PropSource<C extends Error, P extends Props> = P | ((cause: C) => P);

/**
 * Given an error, returns a new error with the specified properties, and the original
 * error as it's cause.
 */
export function wrapError<
  C extends Error = Error,
  P1 extends Props = Props,
  P2 extends Props = Props,
  P3 extends Props = Props,
  P4 extends Props = Props,
  P5 extends Props = Props,
  P6 extends Props = Props,
  P7 extends Props = Props,
  P8 extends Props = Props,
  P9 extends Props = Props,
  P10 extends Props = Props
>(
  cause: C,
  name?: null | string | ((e: C) => string),
  message?: null | string | ((e: C) => string),
  p1?: PropSource<C, P1>,
  p2?: PropSource<C, P2>,
  p3?: PropSource<C, P3>,
  p4?: PropSource<C, P4>,
  p5?: PropSource<C, P5>,
  p6?: PropSource<C, P6>,
  p7?: PropSource<C, P7>,
  p8?: PropSource<C, P8>,
  p9?: PropSource<C, P9>,
  p10?: PropSource<C, P10>
): ErrorWithProps<P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10> &
  ErrorWithCause<C> &
  C &
  P1 &
  P2 &
  P3 &
  P4 &
  P5 &
  P6 &
  P7 &
  P8 &
  P9 &
  P10 {
  const errorName = typeof name === "function" ? name(cause) : name;
  const errorMessage = typeof message === "function" ? message(cause) : message;
  const error = createError(
    errorName ?? cause.name,
    errorMessage ?? cause.message,
    typeof p1 === "function" ? p1(cause) : p1,
    typeof p2 === "function" ? p2(cause) : p2,
    typeof p3 === "function" ? p3(cause) : p3,
    typeof p4 === "function" ? p4(cause) : p4,
    typeof p5 === "function" ? p5(cause) : p5,
    typeof p6 === "function" ? p6(cause) : p6,
    typeof p7 === "function" ? p7(cause) : p7,
    typeof p8 === "function" ? p8(cause) : p8,
    typeof p9 === "function" ? p9(cause) : p9,
    typeof p10 === "function" ? p10(cause) : p10
  );
  return setErrorCause(error, cause);
}

export function wrapRejection<
  T,
  P1 extends Props = Props,
  P2 extends Props = Props,
  P3 extends Props = Props,
  P4 extends Props = Props,
  P5 extends Props = Props,
  P6 extends Props = Props,
  P7 extends Props = Props,
  P8 extends Props = Props,
  P9 extends Props = Props,
  P10 extends Props = Props
>(
  p: Promise<T>,
  name?: null | string | ((e: Error) => string),
  message?: null | string | ((e: Error) => string),
  p1?: PropSource<Error, P1>,
  p2?: PropSource<Error, P2>,
  p3?: PropSource<Error, P3>,
  p4?: PropSource<Error, P4>,
  p5?: PropSource<Error, P5>,
  p6?: PropSource<Error, P6>,
  p7?: PropSource<Error, P7>,
  p8?: PropSource<Error, P8>,
  p9?: PropSource<Error, P9>,
  p10?: PropSource<Error, P10>
): Promise<T> {
  return p.then(null, (cause) => {
    throw wrapError(
      cause,
      name,
      message,
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      p8,
      p9,
      p10
    );
  });
}

export function wrapFailure<
  T,
  P1 extends Props = Props,
  P2 extends Props = Props,
  P3 extends Props = Props,
  P4 extends Props = Props,
  P5 extends Props = Props,
  P6 extends Props = Props,
  P7 extends Props = Props,
  P8 extends Props = Props,
  P9 extends Props = Props,
  P10 extends Props = Props
>(
  fallible: () => T,
  name?: null | string | ((e: Error) => string),
  message?: null | string | ((e: Error) => string),
  p1?: PropSource<Error, P1>,
  p2?: PropSource<Error, P2>,
  p3?: PropSource<Error, P3>,
  p4?: PropSource<Error, P4>,
  p5?: PropSource<Error, P5>,
  p6?: PropSource<Error, P6>,
  p7?: PropSource<Error, P7>,
  p8?: PropSource<Error, P8>,
  p9?: PropSource<Error, P9>,
  p10?: PropSource<Error, P10>
): T {
  try {
    return fallible();
  } catch (cause) {
    throw wrapError(
      cause,
      name,
      message,
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      p8,
      p9,
      p10
    );
  }
}

export function createErrorWrapper<
  C extends Error = Error,
  P1 extends Props = Props,
  P2 extends Props = Props,
  P3 extends Props = Props,
  P4 extends Props = Props,
  P5 extends Props = Props,
  P6 extends Props = Props,
  P7 extends Props = Props,
  P8 extends Props = Props,
  P9 extends Props = Props,
  P10 extends Props = Props
>(
  name?: null | string | ((e: C) => string),
  message?: null | string | ((e: C) => string),
  p1?: PropSource<C, P1>,
  p2?: PropSource<C, P2>,
  p3?: PropSource<C, P3>,
  p4?: PropSource<C, P4>,
  p5?: PropSource<C, P5>,
  p6?: PropSource<C, P6>,
  p7?: PropSource<C, P7>,
  p8?: PropSource<C, P8>,
  p9?: PropSource<C, P9>,
  p10?: PropSource<C, P10>
): (
  cause: C
) => ErrorWithProps<P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10> &
  ErrorWithCause<C> &
  C &
  P1 &
  P2 &
  P3 &
  P4 &
  P5 &
  P6 &
  P7 &
  P8 &
  P9 &
  P10 {
  return (cause: C) =>
    wrapError(cause, name, message, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);
}
