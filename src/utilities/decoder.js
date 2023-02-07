import pkg from 'crypto-js';
import { throwCustomError } from './errorHandler.js';
const { enc } = pkg;

/**
 * Transforms a string to a encoded version.
 * @param  {String} text the original text string
 * @return {String}      a encoded version of the string
 */
export const encrypt = (text) => {
  return enc.Base64.stringify(enc.Utf8.parse(text));
};

/**
 * Transforms a encoded string to its original value.
 * @param  {String} data a encoded with the encript() function string
 * @return {String}      the original value of the string
 */
export const decrypt = (data) => {
  try{
    return enc.Base64.parse(data).toString(enc.Utf8)
  }
  catch{
    (error) => { throwCustomError(error.message)};
  }
};
