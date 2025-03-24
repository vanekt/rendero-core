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
  test("it works with strings: placeholder {{color}} is replaced with 'red'", () => {
    expect(replacePlaceholders("{{color}}", placeholders)).toBe("red");
  });

  test("it works with number: placeholder {{zIndex}} is replaced with 10", () => {
    expect(replacePlaceholders("{{zIndex}}", placeholders)).toBe(10);
  });

  test("it works with arrays", () => {
    expect(
      replacePlaceholders(["{{color}}", "{{zIndex}}"], placeholders)
    ).toEqual(["red", 10]);
  });

  test("it works with objects", () => {
    expect(
      replacePlaceholders({ title: "Color: {{color}}" }, placeholders)
    ).toEqual({ title: "Color: red" });
  });

  test("it works with nested props", () => {
    expect(
      replacePlaceholders(
        {
          metadata: { title: "Color: {{color}}", zIndex: "{{zIndex}}" },
        },
        placeholders
      )
    ).toEqual({ metadata: { title: "Color: red", zIndex: 10 } });
  });

  test("should be unmodified if there are no placeholders", () => {
    expect(replacePlaceholders({ title: "Hello, {{name}}!" }, null)).toEqual({
      title: "Hello, {{name}}!",
    });
  });

  test("should be unmodified if no matching placeholder is found", () => {
    expect(
      replacePlaceholders({ title: "Hello, {{name}}!" }, { foo: "bar" })
    ).toEqual({
      title: "Hello, {{name}}!",
    });
  });

  test("it works with calculated placeholders", () => {
    expect(
      replacePlaceholders(
        "{{e! return 'Color: ' + color + ', opacity: '+ opacity; }}",
        placeholders
      )
    ).toBe("Color: red, opacity: 0.5");
  });

  test("it works with functions", () => {
    expect(replacePlaceholders("{{e! return fn()+fn(); }}", placeholders)).toBe(
      "successsuccess"
    );
    expect(placeholders.fn).toHaveBeenCalledTimes(2);
    expect(placeholders.fn.mock.results[1].value).toBe("success");
  });

  test("it works with complex structire", () => {
    expect(
      replacePlaceholders(
        {
          object: {
            nestedObject: {
              calculated: "{{e! return 1 + 5; }}",
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
        placeholders
      )
    ).toEqual({
      object: {
        nestedObject: {
          calculated: 6,
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
});
