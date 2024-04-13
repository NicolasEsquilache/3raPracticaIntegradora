import passport from 'passport';
import GitHubStrategy from 'passport-github2'
import local from 'passport-local';
import { createHash, isValidatePassword } from '../pass.js';
import User from '../dao/models/user.js';
import { createCart } from '../routes/carts.router.js';

const { Strategy: LocalStrategy } = local;

const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body

            try {
                let user = await User.findOne({ email: username })
                if (user) {
                    console.log('Usuario existente')
                    return done(null, false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }
                let result = await User.create(newUser)
                return done(null, result)
            } catch (error) {
                return done(`'Error al obtener usuario' ${error}`)
            }
        }
    ))

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username })
            if (!user) {
                console.log('Usuario no existe')
                return done(null, false)
            }
            if (!isValidatePassword(user, password)) return done(null, false)
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.78d26c12a816db07',
        clientSecret: '89581dce88b3bc60e1481f704586e967c4a70605',
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile._json.email });
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 20,
                    email: profile._json.email,
                    password: ''
                };
                let createdUser = await User.create(newUser);

                done(null, createdUser);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await User.findById(id)
        done(null, user)
    })
}

export default initializePassport;
