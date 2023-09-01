import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ  : yani databasedeki verileri alma-okuma*/
router.get("/:id", verifyToken, getUser);     //    /:id uzantısında kullanıcının id'sine göre kullanıcıyı getir
router.get("/:id/friends", verifyToken, getUserFriends);   //  /:id/friends uzantısında kullanıcının id'sine göre kullanıcının arkadaşlarını çek

/* UPDATE  : databasede güncelleme yaparken router.patch kullanılır */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend); //   /:id/:friendId uzantısında arkadaşıekleyebilir ya da çıkarabilirsin

export default router;