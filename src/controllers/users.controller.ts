import { Router } from 'express';
import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as passport from 'passport';

import { mongoDb } from '../mongo-db';
import { handleError } from './internal';
import { ObjectID } from 'bson';

const COLLECTION = 'users';
const router = Router();

/** Get current authenticated user profile */
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userObject = _.omit(req.user, ['password']);
    const _id = new ObjectID(req.user._id);
    mongoDb.getCollection(COLLECTION).findOneAndUpdate(
      {_id},
      { $set: { 'profileDetails.lastOnline': new Date()} },
      { returnOriginal: false }
    )
    .catch(err => handleError(res, err.message));
    res.send(userObject); //
});

export { router as usersController };
