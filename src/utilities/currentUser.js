import jwt from "jsonwebtoken"
import User from "../schema/models/user.js"

const currentAuth = async ({ req }) => {
  const auth = req ? req.headers.authorization : null;
  if (auth && auth.startsWith("bearer ")) {
    const token = auth.substring(7);
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(id)
    return { currentUser }
  }
};

export default currentAuth;