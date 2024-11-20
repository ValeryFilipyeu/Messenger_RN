import { validateInput } from "./formActions";

describe("validateInput", () => {
  it("should return undefined for a valid first name", () => {
    const result = validateInput("firstName", "John");
    expect(result).toBeUndefined();
  });

  it("should return an error message for an empty first name", () => {
    const result = validateInput("firstName", "");
    expect(result).toStrictEqual(["First name can't be blank"]);
  });

  it("should return undefined for a valid last name", () => {
    const result = validateInput("lastName", "Doe");
    expect(result).toBeUndefined();
  });

  it("should return an error message for an empty last name", () => {
    const result = validateInput("lastName", "");
    expect(result).toStrictEqual(["Last name can't be blank"]);
  });

  it("should return undefined for a valid email", () => {
    const result = validateInput("email", "test@example.com");
    expect(result).toBeUndefined();
  });

  it("should return an error message for an empty email", () => {
    const result = validateInput("email", "");
    expect(result).toStrictEqual(["Email can't be blank"]);
  });

  it("should return an error message for an invalid email", () => {
    const result = validateInput("email", "test@example");
    expect(result).toStrictEqual(["Email is not a valid email"]);
  });

  it("should return undefined for a valid password", () => {
    const result = validateInput("password", "password123");
    expect(result).toBeUndefined();
  });

  it("should return an error message for a password that is too short", () => {
    const result = validateInput("password", "pass");
    expect(result).toStrictEqual(["Password must be at least 6 characters"]);
  });

  it("should return an error message for an empty password", () => {
    const result = validateInput("password", "");
    expect(result).toStrictEqual(["Password can't be blank"]);
  });
});
