
import passport from 'passport';
import * as passportLocal from "passport-local";
const LocalStrategy = passportLocal.Strategy;
import * as argon2 from 'argon2';
import { User } from '../models/user';

passport.use(new LocalStrategy ({usernameField: 'email'}, (username, password, done) => {
  return User.findOne({ email: username }, (error, user) => {
    if (error) {
      return done(error);
    }
    if (!user) {
      return done(null, false, {
        message: 'Invalid email or password'
      });
    }
    if (user) {
      return validateUserPassword(user.passwordHash, password)
      .then((validated) => {
        if (validated) {
          return done(user);
        } else {
          return done(null, false, {
            message: 'Invalid email or password'
          });
        }
      })
      .catch((verror) => {
        console.log('Error in password validation:');
        console.log(verror);
        return done(verror);
      });
    }
  });
}));

function validateUserPassword(hash, password) {
  return argon2.verify(hash, password)
  .then((verified) => {
    return verified;
  })
  .catch((error) => {
    console.log('Error in hash validation:', error);
    return error;
  });
}

const userService = {
  GetUsers: function () {
    return new Promise((resolve, reject) => {
      User.find()
      .then((users) => {
        resolve(users);
      })
      .catch((error) => {
        reject(error);
      });
    });
  },
  RegisterUser: (user) => {
    return registerUser(user)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.log('Error in userService');
      console.log(error);
      return error;
    });
  },
  UpdateUser: (user, updates) => {
    let updatesAllowed = { };
    if (updates.id) updatesAllowed['id'] = updates.id;
    if (updates.name) updatesAllowed['name'] = updates.name;
    return new Promise<void>((resolve, reject) => {
      user.updateOne(updatesAllowed, (err, result) => {
        if (err) {
          console.log('Update failed: ' + err);
          reject();
        } else {
          console.log('Update success:');
          console.log(result);
          resolve();
        }
      });
    });
  },
  GetUser: (email) => {
    return getUser(email)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.log('Error getting user');
      console.log(error);
      return error;
    });
  },
};

interface RegisterResult {
  emailAddress: String
};

function registerUser(userObject) {
  return new Promise<RegisterResult>((resolve, reject) => {
    const user = new User();
    user.email = userObject.email;
    user.name = userObject.name;
    argon2.hash(userObject.password, { type: argon2.argon2id }).then((hash) => {
      user.passwordHash = hash;
      user.save((error) => {
        if (error) {
          console.log('Error saving user');
          console.log(error);
          reject(error);
        }
        resolve({ emailAddress: user.email });
      });
    }).catch((error) => {
      console.log('Error hashing user password');
      console.log(error);
      reject(error);
    });
  });
}

interface LoginResult {
  user?: any,
  token?: string,
  message?: string
}

function loginUser(req, res) {
  return new Promise<LoginResult>((resolve, reject) => {
    passport.authenticate('local', (user, error, info) => {
      if (error) {
        console.log('Error authenticating user:');
        console.log(error);
        reject(error);
      }
      if (info) {
        console.log('Info from authenticate user:');
        console.log(info);
        reject(info);
      }
      if (user) {
        resolve({ user });
      }
    })(req, res);
  });
}

function getUser(email) {
  return User.findOne({email})
  .then((user) => {
    if (!user) {
      return ({message: 'Error getting user'});
    } else {
      return user;
    }
  });
}

export { userService, loginUser };
