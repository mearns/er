type Props = Record<string | number | symbol, unknown>;

type StartingPoint = Function; // eslint-disable-line @typescript-eslint/ban-types

export const BaseClassProp = Symbol("BaseClass");
export const FactoryFunctionProp = Symbol("FactoryFunction");

type WithBaseClass<E extends Error = Error, P extends Props = Props> = {
  [BaseClassProp]: new (name: string, message: string, props: P) => E;
};

type WithFactoryFunction<E extends Error = Error, P extends Props = Props> = {
  [FactoryFunctionProp]: (name: string, message: string, props: P) => E;
};

type WithErrorType<E extends Error = Error, P extends Props = Props> =
  | WithBaseClass<E, P>
  | WithFactoryFunction<E, P>;

function hasBaseClass<P extends Props>(
  p: Props
): p is WithBaseClass<P extends WithBaseClass<infer E, P> ? E : never, P> {
  return Object.hasOwnProperty.call(p, BaseClassProp);
}

function hasFactoryFunction<P extends Props>(
  p: Props
): p is WithFactoryFunction<
  P extends WithFactoryFunction<infer E, P> ? E : never,
  P
> {
  return Object.hasOwnProperty.call(p, FactoryFunctionProp);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WithConflictingErrorType = WithBaseClass<any, any> &
  WithFactoryFunction<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

type NonConflictingErrorType<P extends Props> =
  P extends WithConflictingErrorType ? never : P;

type ErrorType<P extends Props> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NonConflictingErrorType<P> extends WithErrorType<infer E, any> ? E : Error;

export type ErrorWithProps<
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
> = ErrorType<P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10> &
  P1 &
  P2 &
  P3 &
  P4 &
  P5 &
  P6 &
  P7 &
  P8 &
  P9 &
  P10;

export function createErrorStartingAbove<
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
  startingAbove: StartingPoint,
  name: string,
  message: string,
  p1?: P1,
  p2?: P2,
  p3?: P3,
  p4?: P4,
  p5?: P5,
  p6?: P6,
  p7?: P7,
  p8?: P8,
  p9?: P9,
  p10?: P10
): ErrorWithProps<P1, P2, P3, P4, P5, P6, P7, P8, P9, P10> {
  const props: P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 = Object.assign(
    p1 ?? {},
    p2 ?? {},
    p3 ?? {},
    p4 ?? {},
    p5 ?? {},
    p6 ?? {},
    p7 ?? {},
    p8 ?? {},
    p9 ?? {},
    p10 ?? {}
  );

  const error: ErrorType<P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10> =
    hasBaseClass(props)
      ? new props[BaseClassProp](name, message, props)
      : hasFactoryFunction(props)
      ? props[FactoryFunctionProp](name, message, props)
      : (new Error(message) as ErrorType<
          P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10
        >);
  error.name = name;
  Error.captureStackTrace(error, startingAbove);
  delete props[BaseClassProp];
  delete props[FactoryFunctionProp];
  return Object.assign(error, props);
}

export function createError<
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
  name: string,
  message: string,
  p1?: P1,
  p2?: P2,
  p3?: P3,
  p4?: P4,
  p5?: P5,
  p6?: P6,
  p7?: P7,
  p8?: P8,
  p9?: P9,
  p10?: P10
): ErrorWithProps<P1, P2, P3, P4, P5, P6, P7, P8, P9, P10> {
  return createErrorStartingAbove(
    createError,
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
