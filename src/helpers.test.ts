import { jest, afterEach, describe, test, expect } from "@jest/globals";
import { replacePlaceholders } from "./helpers";

const placeholders = {
  color: "red",
  zIndex: 10,
  disabled: true,
  opacity: 0.5,
  bigint: 10n,
  array: [1, 2, 3],
  fn: jest.fn(() => "success"),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("replacePlaceholders function", () => {
  test("correctly replaces a string placeholder with its value", () => {
    expect(replacePlaceholders("{{color}}", placeholders)).toBe("red");
  });

  test("correctly replaces a numeric placeholder with its value", () => {
    expect(replacePlaceholders("{{zIndex}}", placeholders)).toBe(10);
  });

  test("replaces placeholders inside an array", () => {
    expect(
      replacePlaceholders(["{{color}}", "{{zIndex}}"], placeholders),
    ).toEqual(["red", 10]);
  });

  test("replaces placeholders inside an object", () => {
    expect(
      replacePlaceholders({ title: "Color: {{color}}" }, placeholders),
    ).toEqual({ title: "Color: red" });
  });

  test("replaces placeholders inside a nested object", () => {
    expect(
      replacePlaceholders(
        {
          metadata: { title: "Color: {{color}}", zIndex: "{{zIndex}}" },
        },
        placeholders,
      ),
    ).toEqual({ metadata: { title: "Color: red", zIndex: 10 } });
  });

  test("does not modify the input if no placeholders", () => {
    expect(replacePlaceholders({ title: "Hello, {{name}}!" }, null)).toEqual({
      title: "Hello, {{name}}!",
    });
  });

  test("does not modify the input if no matching placeholder is found", () => {
    expect(
      replacePlaceholders({ title: "Hello, {{name}}!" }, { foo: "bar" }),
    ).toEqual({
      title: "Hello, {{name}}!",
    });
  });

  test("works with calculated placeholders", () => {
    expect(
      replacePlaceholders(
        "{{e! return 'Color: ' + color + ', opacity: '+ opacity; }}",
        placeholders,
      ),
    ).toBe("Color: red, opacity: 0.5");
  });

  test("works with functions", () => {
    expect(replacePlaceholders("{{e! return fn()+fn(); }}", placeholders)).toBe(
      "successsuccess",
    );
    expect(placeholders.fn).toHaveBeenCalledTimes(2);
    expect(placeholders.fn.mock.results[1].value).toBe("success");
  });

  test("works with complex structire", () => {
    expect(
      replacePlaceholders(
        {
          object: {
            nestedObject: {
              calculated: "{{e! return 1 + 5; }}",
              stringWithCalc: "Total: {{e! return 1 + 5; }}", // TODO separate case
              boolean: "{{disabled}}",
              nestedObject: {
                float: "{{opacity}}",
                bigint: "{{bigint}}",
                notFound: "{{notFound}}",
                notFoundCalc: "{{e! return notFound; }}",
                array: [{ color: "{{color}} " }, { zIndex: "{{zIndex}}" }],
                array2: "{{array}}",
                fnResult: "{{e! return fn();}}",
              },
            },
          },
        },
        placeholders,
      ),
    ).toEqual({
      object: {
        nestedObject: {
          calculated: 6,
          stringWithCalc: "Total: 6",
          boolean: true,
          nestedObject: {
            float: 0.5,
            bigint: 10n,
            notFound: "{{notFound}}",
            notFoundCalc: "{{e! return notFound; }}",
            array: [{ color: "red " }, { zIndex: 10 }],
            array2: [1, 2, 3],
            fnResult: "success",
          },
        },
      },
    });

    expect(placeholders.fn).toHaveBeenCalledTimes(1);
  });

  test("returns empty string if input is empty", () => {
    expect(replacePlaceholders("", placeholders)).toBe("");
  });

  test("returns the same string if there are no placeholders in expression", () => {
    expect(replacePlaceholders("Hello, world!", placeholders)).toBe(
      "Hello, world!",
    );
  });

  test("does not replace malformed placeholders", () => {
    expect(replacePlaceholders("{color}}", placeholders)).toBe("{color}}");
  });

  test("does not replace placeholders with spaces inside", () => {
    expect(replacePlaceholders("{{ color }}", placeholders)).toBe(
      "{{ color }}",
    );
  });

  test("leaves the expression unchanged if a variable is not found", () => {
    expect(
      replacePlaceholders("{{e! return unknownVar; }}", placeholders),
    ).toBe("{{e! return unknownVar; }}");
  });

  test("returns null if input is null", () => {
    expect(replacePlaceholders(null, placeholders)).toBe(null);
  });

  test("returns undefined if input is undefined", () => {
    expect(replacePlaceholders(undefined, placeholders)).toBe(undefined);
  });
});
