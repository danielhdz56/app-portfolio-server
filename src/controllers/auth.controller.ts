import { Router } from 'express';
import * as bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

import { default as secretToken } from '../config/auth'; // TODO: assign secret key to ENV
import { mongoDb } from '../mongo-db';
import * as authService from '../services/auth.service';
import * as usersService from '../services/users.service';

const COLLECTION = 'users';
const secret = secretToken.secret;
const router = Router();

/** Route to login and recieve token for authorization */
router.post('/login', function (req, res) {
  if (req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;
    let payload, token, userResponse;
    mongoDb.getCollection(COLLECTION).findOne({ email }, (err, user) => {
      if (!user) {
        res.status(401).json({ message: 'Failed to log in with the email and password provided' });
        return;
      }
      if (bcrypt.compareSync(password, user.password)) {
        // token payload is created with _id
        payload = { _id: user._id };
        token = jwt.sign(payload, secretToken.secret);
        userResponse = _.omit(user, ['password']);
        res.json({ user: userResponse, token: 'JWT ' + token });
      } else {
        res.status(401).json({ message: 'Failed to log in with the email and password provided' });
      }
    });
  } else {
    res.status(401).json({ message: 'Both email and password are required to login'});
  }

});

/** Route to register and add new user to DB after hashing password */
router.post('/register', (req, res) => {
  if (req.body.email && req.body.password, req.body.username) {
    const {username, email, password, avatarUrl} = req.body;
    const encryptedPassword = authService.encryptPassword(password);
    let payload, token, userResponse;

    mongoDb.getCollection(COLLECTION).findOne({ email }, (err, user) => {
      if (!user) {
        mongoDb.getCollection(COLLECTION).findOne({ username }, (err, user) => {
          if (!user) {
            mongoDb.getCollection(COLLECTION).insertOne(
              {
                email,
                password:
                encryptedPassword,
                username,
                avatarUrl,
                profileDetails: {
                  firstName: '',
                  lastName: '',
                  lastOnline: new Date(),
                }
              }
            )
            .then((insertedUser) => {
              userResponse = { _id: insertedUser.insertedId, email, username }
              payload = { _id: insertedUser.insertedId };
              token = jwt.sign(payload, secretToken.secret);
              res.status(200).json({ user: userResponse, token: 'JWT ' + token })
            })
            .catch(() => res.status(401).json({ message: 'User was not added' }));
          } else {
            res.send({ message: 'A user with that username exists' });
          }
        })
      } else {
        res.send({ message: 'A user with that email exists' });
      }
    });
  } else {
    res.status(401).json({ message: 'An email, username, and password are required to register' });
  }
});

router.post('/resetpassword', (req, res) => {
  if (!req.body.token || !req.body.password) {
    res.status(403).json({ message: 'Token & password must be provided' })
  }
  const token = req.body.token.replace(/^JWT\s/, '');
  const newPassword = req.body.password;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json(err.message);
    if (decoded.exp < (new Date()).valueOf()) return res.status(403).json({ message: 'Reset password request has expired '});

    const id = decoded._id;
    usersService.changePasswordByID(id, newPassword)
      .then(() => res.status(200).json({ message: 'Password reset successful' }))
      .catch(() => res.status(401).json({ message: 'Could not updated password, please try again.'}));
  });

});

export { router as authController };