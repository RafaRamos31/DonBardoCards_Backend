import { UserInputError } from "apollo-server";
import { GraphQLError } from "graphql";

export function throwNotFoundError(element) {
  throw new GraphQLError(`${element} not found`, {
    extensions: { code: "NOT_FOUND_ERROR" },
  });
}

export function throwInvalidIDError(element) {
  throw new UserInputError(`Invalid ${element} ID format`);
}

export function throwInvalidArgsError(message, args) {
  throw new UserInputError(message, {
    invalidArgs: args,
  });
}

export function throwCustomError(message, code) {
  throw new GraphQLError(message, { extensions: { code } });
}

export function throwUserInputError(message) {
  throw new UserInputError(message);
}