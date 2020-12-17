const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const { isLoggedIn } = require("./middlewares");
const Post = require("../models/Post");
const Hashtag = require("../models/Hashtag");

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.log("uploads폴더가 없으므로 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// form에서 img에 해당하는 것을 가져옴(single('img'))
router.post("/img", isLoggedIn, upload.single("img"), (req, res, next) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` }); // 실제 파일은 uploads에 있지만 요청 주소는 /img/이다.
});

// 게시글 업로드
router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: sanitizeHtml(req.body.content),
      img: sanitizeHtml(req.body.url),
      UserId: req.user.id,
    });
    const hashtags = [
      ...new Set(sanitizeHtml(req.body.content).match(/#[^\s#]*/g)),
    ];
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          // 트랜잭션으로 이루어지는 메소드 findOrCreate
          // 있으면 update, 없으면 insert하는 upsert라는 것도 있다.
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      // result 결과로 [['결과 해시태그', true], ['결과 해시태그', true]] 이런 식으로 나옴. true면 없어서 create했다. false면 찾았다.
      await post.addHashtag(result.map((v) => v[0])); // create 결과물인 post에 addHashtags로 넣을 수 있다.
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id/delete", async (req, res, next) => {
  try {
    // 실제 사용자가 삭제하는거 맞는지 이중 검사
    await Post.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.send("successfully deleted");
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.patch("/:id/like", async (req, res, next) => {
  try {
    console.log(
      `${req.user.id} 사용자가 ${req.params.id}번 게시물을 좋아합니다`
    );
    const post = await Post.findOne({
      where: { id: req.params.id },
    });
    post.addLiker(req.user.id);
    res.send("like button clicked");
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.patch("/:id/unlike", async (req, res, next) => {
  try {
    console.log(
      `${req.user.id} 사용자가 ${req.params.id}번 게시물을 좋아요 취소합니다`
    );
    const post = await Post.findOne({
      where: { id: req.params.id },
    });
    post.removeLiker(req.user.id);
    res.send("unlike button clicked");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
