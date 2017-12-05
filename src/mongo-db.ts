import { Collection, Db, MongoClient } from 'mongodb';

export class MongoDb {
  private _database: Db;

  getCollection (name: string):  Collection {
    let collection: Collection;

    if (!this._database) {
      throw new Error('MongoDB database is not connected');
    }

    collection = this._database.collection(name);
    if (!collection) {
      throw new Error(`MongoDB collection ${ name } does not exist`);
    }

    return collection;
  }

  connect (location: string) {
    return MongoClient.connect(location).then(db => this._database = db);
  }
}

export const mongoDb = new MongoDb();