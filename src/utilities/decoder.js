import pkg from 'crypto-js';
const { enc } = pkg;

export const encrypt = (text) => {
  return enc.Base64.stringify(enc.Utf8.parse(text));
};

export const decrypt = (data) => {
  return enc.Base64.parse(data).toString(enc.Utf8);
};
