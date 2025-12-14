const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are provided
console.log('🔍 Checking Google OAuth credentials...');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Found' : '❌ Missing');
console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Found' : '❌ Missing');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Initializing Google OAuth Strategy...');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 
          (process.env.NODE_ENV === 'production' 
            ? 'https://elevare-hvtr.onrender.com/api/auth/google/callback'
            : 'http://localhost:5000/api/auth/google/callback'),
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email (from local auth)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.authProvider = 'google';
          user.isEmailVerified = true; // Google emails are verified
          if (profile.photos && profile.photos.length > 0) {
            user.profile.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          authProvider: 'google',
          isEmailVerified: true, // Google emails are verified
          profile: {
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          },
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
    )
  );
  console.log('✅ Google OAuth Strategy initialized successfully!');
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google login will not be available.');
  console.warn('   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.');
  console.warn('   Current values:');
  console.warn('   - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'undefined');
  console.warn('   - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET || 'undefined');
}

module.exports = passport;
