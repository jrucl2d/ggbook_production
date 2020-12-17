const User = require("../models/User");
const { isLoggedIn } = require("./middlewares");
const sanitizeHtml = require("sanitize-html");

const router = require("express").Router();

router.patch("/newNick", isLoggedIn, async (req, res, next) => {
  await User.update(
    { nick: sanitizeHtml(req.body.newNick) },
    { where: { id: req.user.id } }
  );
  res.send("success");
});

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 내가 누군지 찾음
    if (user) {
      // setFollowings나 removeFollowings, getFollowings 사용 가능. 그러나 set 쓰면 기존 정보를 모두 날리고 설정하므로 조심.
      // 여러 개를 한 번에 addFollowings하면 파라미터에 배열을 넣어주면 된다.
      await user.addFollowings(parseInt(req.params.id, 10)); // 내가 id번 사용자를 팔로잉 하는 것.
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/:id/unfollow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 현재 유저 정보 가져와서
    if (user) {
      await user.removeFollowing(parseInt(req.params.id, 10)); // 상대방 팔로잉 제거
      res.send("success");
    } else {
      res.status(404).send("no-user");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
