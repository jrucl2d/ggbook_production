const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/User");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      // accessToken과 refreshToken은 Oauth2에서 사용됨.
      async (accessToken, refreshToken, profile, done) => {
        console.log("카카오 프로필 : ", profile);
        try {
          const exUser = await User.findOne({
            where: {
              snsId: profile.id,
              provider: "kakao",
            },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
