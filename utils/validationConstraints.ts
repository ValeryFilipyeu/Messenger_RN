import { validate } from "validate.js";

interface ConstraintsLength {
  presence: { allowEmpty: boolean };
  length?: {
    minimum?: number;
    maximum?: number;
  };
}

export const validateLength = (
  id: string,
  value: string,
  minLength: number,
  maxLength: number,
  allowEmpty: boolean
): undefined | [string] => {
  const constraints: ConstraintsLength = {
    presence: { allowEmpty },
  };

  if (!allowEmpty || value !== "") {
    constraints.length = {};

    if (minLength != null) {
      constraints.length.minimum = minLength;
    }

    if (maxLength != null) {
      constraints.length.maximum = maxLength;
    }
  }

  const validationResult = validate({ [id]: value }, { [id]: constraints });

  return validationResult && validationResult[id];
};

interface ConstraintsString {
  presence: { allowEmpty: boolean };
  format?: { pattern: string; flags: string; message: string };
}

export const validateString = (
  id: string,
  value: string
): undefined | [string] => {
  const constraints: ConstraintsString = {
    presence: { allowEmpty: false },
  };

  if (value !== "") {
    constraints.format = {
      pattern: "[a-z]+",
      flags: "i",
      message: "value can only contain letters",
    };
  }

  const validationResult = validate({ [id]: value }, { [id]: constraints });

  return validationResult && validationResult[id];
};

interface ConstraintsEmail {
  presence: { allowEmpty: boolean };
  email?: boolean;
}

export const validateEmail = (
  id: string,
  value: string
): undefined | [string] => {
  const constraints: ConstraintsEmail = {
    presence: { allowEmpty: false },
  };

  if (value !== "") {
    constraints.email = true;
  }

  const validationResult = validate({ [id]: value }, { [id]: constraints });

  return validationResult && validationResult[id];
};

interface ConstraintsPassword {
  presence: { allowEmpty: boolean };
  length?: {
    minimum: number;
    message: string;
  };
}

export const validatePassword = (
  id: string,
  value: string
): undefined | [string] => {
  const constraints: ConstraintsPassword = {
    presence: { allowEmpty: false },
  };

  if (value !== "") {
    constraints.length = {
      minimum: 6,
      message: "must be at least 6 characters",
    };
  }

  const validationResult = validate({ [id]: value }, { [id]: constraints });

  return validationResult && validationResult[id];
};
