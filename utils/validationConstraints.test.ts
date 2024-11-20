import {
  validateString,
  validateEmail,
  validatePassword,
} from "./validationConstraints";

describe("validateString", () => {
  it("should return undefined for a valid string", () => {
    const result = validateString("name", "John");
    expect(result).toBeUndefined();
  });

  it("should return string error item array for an empty string", () => {
    const result = validateString("name", "");
    expect(result).toStrictEqual(["Name can't be blank"]);
  });

  it("should return string error item array for a string with numbers", () => {
    const result = validateString("name", "John123");
    expect(result).toStrictEqual(["Name value can only contain letters"]);
  });

  it("should return string error item array for a string with special characters", () => {
    const result = validateString("name", "John@Doe");
    expect(result).toStrictEqual(["Name value can only contain letters"]);
  });
});

describe("validateEmail", () => {
  it("should return undefined for a valid email", () => {
    const result = validateEmail("email", "test@example.com");
    expect(result).toBeUndefined();
  });

  it("should return string error item array for an empty email", () => {
    const result = validateEmail("email", "");
    expect(result).toStrictEqual(["Email can't be blank"]);
  });

  it("should return string error item array for an invalid email", () => {
    const result = validateEmail("email", "test@example");
    expect(result).toStrictEqual(["Email is not a valid email"]);
  });
});

describe("validatePassword", () => {
  it("should return undefined for a valid password", () => {
    const result = validatePassword("password", "password123");
    expect(result).toBeUndefined();
  });

  it("should return an error message for a password that is too short", () => {
    const result = validatePassword("password", "pass");
    expect(result).toStrictEqual(["Password must be at least 6 characters"]);
  });

  it("should return an error message for an empty password", () => {
    const result = validatePassword("password", "");
    expect(result).toStrictEqual(["Password can't be blank"]);
  });
});
