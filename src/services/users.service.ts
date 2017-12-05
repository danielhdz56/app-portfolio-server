import { ObjectID } from 'mongodb';
import { mongoDb } from '../mongo-db';
import * as authService from './auth.service';

const COLLECTION = 'users';

export function getByUserId (id) {
  return mongoDb.getCollection(COLLECTION).findOne(new ObjectID(id));
}

export function changePasswordByID (id, newPassword) {
  const encryptedPassword = authService.encryptPassword(newPassword);
  return mongoDb.getCollection(COLLECTION)
    .findOneAndUpdate({
      _id: new ObjectID(id)
    }, { $set: { password: encryptedPassword } })
};