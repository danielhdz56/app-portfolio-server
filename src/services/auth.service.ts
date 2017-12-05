import * as bcrypt from 'bcrypt-nodejs';

export function encryptPassword (password) {
  const salt = bcrypt.genSaltSync(10000);
  const hash = bcrypt.hashSync(password, salt);
  password = hash;
  return password;
};