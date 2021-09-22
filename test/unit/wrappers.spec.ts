/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// Module under test
import * as er from "../../src/index";

// Support
import "jest-error-matcher";

describe("wrappers", () => {
  function createCause(): Error & { foo: string; bar: string } {
    return er.createError(
      "OriginalError123",
      "This is the cause of all your problems",
      { foo: "original foo value", bar: "original bar value" }
    );
  }

  describe("wrapError", () => {
    it("should set the 'cause' property of the returned error", () => {
      const originalError = createCause();
      const error = er.wrapError(
        originalError,
        "WrappedError678",
        "This is my wrapper message"
      );
      expect(error).toBeErrorMatching({
        name: "WrappedError678",
        message: "This is my wrapper message",
      });
      expect(error.cause).toBeErrorMatching({
        name: "OriginalError123",
        message: "This is the cause of all your problems",
        foo: "original foo value",
        bar: "original bar value",
        stack: originalError.stack,
      });
      expect(Object.keys(error.cause)).toEqual([
        "name",
        "message",
        "stack",
        "foo",
        "bar",
      ]);
    });

    it("should set the 'causeChain' property of the returned error", () => {
      const originalError = createCause();
      const error = er.wrapError(
        originalError,
        "WrappedError678",
        "This is my wrapper message"
      );
      expect(error.causeChain).toBeInstanceOf(Array);
      expect(error.causeChain).toHaveLength(1);
      expect(error.causeChain).toEqual([
        {
          name: "OriginalError123",
          message: "This is the cause of all your problems",
          foo: "original foo value",
          bar: "original bar value",
          stack: originalError.stack,
        },
      ]);
    });

    it("should set the 'causeChain' property of the returned error when the cause already has a causeChain", () => {
      const originalError = createCause();
      const secondError = er.wrapError(
        originalError,
        "SecondError456",
        "Another message in the middle"
      );
      const error = er.wrapError(
        secondError,
        "WrappedError678",
        "This is my wrapper message"
      );
      expect(error.causeChain).toBeInstanceOf(Array);
      expect(error.causeChain).toHaveLength(2);
      expect(error.causeChain[0]).toBeErrorMatching({
        name: "SecondError456",
        message: "Another message in the middle",
      });
      expect(error.causeChain[1]).toBeErrorMatching({
        name: "OriginalError123",
        message: "This is the cause of all your problems",
        foo: "original foo value",
        bar: "original bar value",
        stack: originalError.stack,
      });
    });

    it("should create an error with the specified name", () => {
      const error = er.wrapError(
        createCause(),
        "WrappedError678",
        "This is my wrapper message"
      );
      expect(error.name).toEqual("WrappedError678");
    });

    it("should create an error with the specified message", () => {
      const error = er.wrapError(
        createCause(),
        "WrappedError678",
        "This is my wrapper message"
      );
      expect(error.message).toEqual("This is my wrapper message");
    });

    it("should copy non-conflicting properties from the cause into the created error", () => {
      const error = er.wrapError(
        createCause(),
        "WrappedError678",
        "This is my wrapper message"
      );
      expect(error.foo).toEqual("original foo value");
      expect(error.bar).toEqual("original bar value");
    });

    it("should not overwrite specified properties with conflicting properties from the cause", () => {
      const error = er.wrapError(
        createCause(),
        "WrappedError678",
        "This is my wrapper message",
        { foo: "new foo value" }
      );
      expect(error.foo).toEqual("new foo value");
      expect(error.bar).toEqual("original bar value");
    });
  });
});
