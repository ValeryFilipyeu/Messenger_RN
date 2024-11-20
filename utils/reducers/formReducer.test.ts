import { reducer } from "./formReducers";

describe("reducer", () => {
  it("should update state with new input values", () => {
    const initialState = {
      inputValues: { name: "", email: "" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: false,
    };
    const action = {
      inputId: "name",
      inputValue: "John Doe",
      validationResult: undefined,
    };
    const expectedState = {
      inputValues: { name: "John Doe", email: "" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: true,
    };
    const result = reducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

  it("should update state with new input validities", () => {
    const initialState = {
      inputValues: { name: "", email: "" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: false,
    };
    const action = {
      inputId: "email",
      inputValue: "johndoe@example.com",
      validationResult: undefined,
    };
    const expectedState = {
      inputValues: { name: "", email: "johndoe@example.com" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: true,
    };
    const result = reducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

  it("should update formIsValid to true when all inputValidities are undefined", () => {
    const initialState = {
      inputValues: { name: "", email: "" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: false,
    };
    const action = {
      inputId: "email",
      inputValue: "johndoe@example.com",
      validationResult: undefined,
    };
    const expectedState = {
      inputValues: { name: "", email: "johndoe@example.com" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: true,
    };
    const result = reducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

  it("should update formIsValid to false when at least one inputValidity is not undefined", () => {
    const initialState = {
      inputValues: { name: "", email: "" },
      inputValidities: { name: undefined, email: undefined },
      formIsValid: false,
    };
    const action = {
      inputId: "email",
      inputValue: "invalid-email",
      validationResult: ["Email is invalid"],
    };
    const expectedState = {
      inputValues: { name: "", email: "invalid-email" },
      inputValidities: { name: undefined, email: ["Email is invalid"] },
      formIsValid: false,
    };
    // @ts-ignore
    const result = reducer(initialState, action);
    expect(result).toEqual(expectedState);
  });
});
