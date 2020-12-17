const User = require("../models/User");
const Post = require("../models/Post");
const { Hashtag } = require("../models");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

const router = require("express").Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

router.get("/profile", (req, res, next) => {
  res.render("profile", { title: "프로필" });
});

router.get("/join", csrfProtection, (req, res, next) => {
  res.render("join", { title: "회원가입", csrfToken: req.csrfToken() });
});

router.get("/", csrfProtection, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Liker",
        },
        {
          model: User,
          attributes: ["id", "nick"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    // posts안에 여러 post들이 들어있고, 그 안에 각각 Liker을 갖는다. Liker가 배열 형태로 나오므로 Liker[n]의 id가 바로 좋아요 누른 사람이다.
    // console.log(posts[n].Liker[m].id);
    let isLiker = []; // 현재 로그인 한 유저가 가지고 있는 좋아요 누른 글을 파악
    if (posts) {
      posts.forEach((post) => {
        post.Liker &&
          post.Liker.forEach((v) => {
            if (req.user && v.id === req.user.id) {
              isLiker.push(post.id); // 현재 글의 아이디를 저장
            }
          });
      });
    }

    res.render("main", {
      title: "NodeBird",
      twits: posts,
      isLiker,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 해시태그 검색. GET /hashtag?hashtag=뭐뭐
router.get("/hashtag", csrfProtection, async (req, res, next) => {
  const query = decodeURIComponent(req.query.hashtag);
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    let isLiker = [];
    if (hashtag) {
      posts = await hashtag.getPosts({
        include: [
          {
            model: User,
            attributes: ["id", "nick"],
            as: "Liker",
          },
          {
            model: User,
            attributes: ["id", "nick"],
          },
        ],
      });

      if (posts) {
        posts.forEach((post) => {
          post.Liker &&
            post.Liker.forEach((v) => {
              if (req.user && v.id === req.user.id) {
                isLiker.push(post.id); // 현재 글의 아이디를 저장
              }
            });
        });
      }
    }
    return res.render("main", {
      title: `${query} 검색 결과` || "껄껄북",
      twits: posts,
      isLiker,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
