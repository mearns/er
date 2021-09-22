/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// Module under test
import * as er from "../../src/index";

// Support
import "jest-error-matcher";

describe("createError", () => {
  it("should return an instance of Error", () => {
    const errorUnderTest: Error = er.createError(
      "TestError123",
      "This is a test message 456"
    );
    expect(errorUnderTest).toBeInstanceOf(Error);
  });

  it("should set the name property of the returned error", () => {
    const errorUnderTest: Error = er.createError(
      "TestError123",
      "This is a test message 456"
    );

    expect(errorUnderTest.name).toEqual("TestError123");
  });

  it("should set the message property of the returned error", () => {
    const errorUnderTest: Error = er.createError(
      "TestError123",
      "This is a test message 456"
    );

    expect(errorUnderTest.message).toEqual("This is a test message 456");
  });

  it("should set the stack property value to include the given name and message, and start the stack trace where the createError function was called.", () => {
    function testErrorProducer() {
      return er.createError("TestError123", "This is a test message 456");
    }
    const errorUnderTest: Error = testErrorProducer();

    expect(errorUnderTest.stack).toMatch(
      /^TestError123: This is a test message 456\n {4}at testErrorProducer /m
    );
  });

  it("should merge additional properties into the returned error and be typed correctly to include those properties", () => {
    const errorUnderTest: Error & {
      foo: string;
      count: number;
      bar: boolean;
      deepProps: { baz: Array<number> };
    } = er.createError(
      "TestError123",
      "This is a test message 456",
      { foo: "foo value", count: 1 },
      { count: 5, bar: true, deepProps: { baz: [1, 2, 3] } }
    );

    expect(errorUnderTest).toBeErrorMatching({
      name: "TestError123",
      message: "This is a test message 456",
      foo: "foo value",
      count: 5,
      bar: true,
      deepProps: { baz: [1, 2, 3] },
    });
  });

  it("should support a custom base class", () => {
    class BaseError123 extends Error {
      constructorProps: { fooValue: number; barValue: boolean };
      constructor(
        name: string,
        message: string,
        props: { foo: number; bar: boolean }
      ) {
        super(message);
        this.constructorProps = { fooValue: props.foo, barValue: props.bar };
      }
    }

    const errorUnderTest: BaseError123 & {
      foo: number;
      baz: string;
      trot: Array<number>;
      bar: boolean;
    } = er.createError(
      "MyError",
      "An error message",
      {
        foo: 1,
        baz: "value of baz",
      },
      { [er.BaseClassProp]: BaseError123, trot: [1, 2, 3] },
      { bar: true }
    );

    expect(errorUnderTest).toBeInstanceOf(BaseError123);
    expect(errorUnderTest).toBeErrorMatching({
      name: "MyError",
      message: "An error message",
      constructorProps: { fooValue: 1, barValue: true },
      baz: "value of baz",
      trot: [1, 2, 3],
      bar: true,
      foo: 1,
    });
    expect(Object.hasOwnProperty.call(errorUnderTest, er.BaseClassProp)).toBe(
      false
    );
  });

  describe.each([["factory function"]])("%s", (description: string) => {
    class BaseError123 extends Error {
      constructorProps: { fooValue: number; barValue: boolean };
      constructor(
        name: string,
        message: string,
        props: { foo: number; bar: boolean }
      ) {
        super(message);
        this.constructorProps = { fooValue: props.foo, barValue: props.bar };
      }
    }

    it(`should infer the given base class from the ${description}`, () => {
      type ExpectedType = BaseError123 & {
        foo: number;
        baz: string;
        trot: Array<number>;
        bar: boolean;
      };

      const factoryFunction = (
        name: string,
        message: string,
        props: { foo: number; bar: boolean }
      ) => new BaseError123(name, message, props);

      const errorUnderTest: ExpectedType = er.createError(
        "MyError",
        "An error message",
        {
          foo: 1,
          baz: "value of baz",
        },
        {
          [er.FactoryFunctionProp]: factoryFunction,
          trot: [1, 2, 3],
        },
        { bar: true }
      );

      noop<ExpectedType>(errorUnderTest);
    });

    it(`should invoke the given ${description} to instantiate the base error`, () => {
      const factoryFunction = (
        name: string,
        message: string,
        props: { foo: number; bar: boolean }
      ) =>
        new BaseError123(name, message + " from the factory", {
          foo: props.foo + 1,
          bar: !props.bar,
        });

      const errorUnderTest = er.createError(
        "MyError",
        "An error message",
        {
          foo: 1,
          baz: "value of baz",
        },
        {
          [er.FactoryFunctionProp]: factoryFunction,
          trot: [1, 2, 3],
        },
        { bar: true }
      );
      expect(errorUnderTest).toBeInstanceOf(BaseError123);
      expect(errorUnderTest).toBeErrorMatching({
        name: "MyError",
        message: "An error message from the factory",
        constructorProps: { fooValue: 2, barValue: false },
        baz: "value of baz",
        trot: [1, 2, 3],
        bar: true,
        foo: 1,
      });
      expect(
        Object.hasOwnProperty.call(errorUnderTest, er.FactoryFunctionProp)
      ).toBe(false);
    });
  });
});

function noop<T>(ignored: T): void {
  // noop
}
