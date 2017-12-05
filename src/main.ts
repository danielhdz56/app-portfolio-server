import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';

import { usersController, authController } from './controllers';
import { mongoDb } from './mongo-db';
import { default as secretToken } from './config/auth';
import * as usersService from './services';

const app = express();

app.use(bodyParser.json());

app.get('/ping', (req, res) => res.send('pong')); // test to see if connection is made

// enpoints
app.use('/api/users', usersController);
app.use('/api/auth', authController);

mongoDb.connect('mongodb://localhost:27017/portfolio-dev') // TODO. Add environment
    .then(() => {
        const server = app.listen(process.env.PORT || 8080, () => console.log(`Server running on port ${ server.address().port }`));
    })
    .catch(err => {
        console.log(`Error: ${ err }`);
        process.exit(1);
    });

app.use(passport.initialize());
passport.use(initializePassportJwt());

function initializePassportJwt () {
    return new passportJwt.Strategy({
      // TODO. change fromAuthHeaderWithScheme to fromAuthHeaderAsBearerToken
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      secretOrKey: secretToken.secret
    },
    function (jwtPayload, next) {
      usersService.getByUserId(jwtPayload._id)
        .then(user => next(null, user))
        .catch(() => next(null, null));
    });
};
