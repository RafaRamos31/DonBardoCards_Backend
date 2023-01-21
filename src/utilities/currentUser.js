import jwt from "jsonwebtoken"
import { findUserById } from "../controllers/userController.js";

/**
 * Look in the page headers for the Authorization value, to get the current logged user
 * @param  {object} req the page request object
 * @return {User}      the current logged user
 */
const currentAuth = async ({ req }) => {
  const auth = req ? req.headers.authorization : null;
  if (auth && auth.startsWith("bearer ")) {
    const token = auth.substring(7);
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await findUserById(id)
    return { currentUser }
  }
};

export default currentAuth;