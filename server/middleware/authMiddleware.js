const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Step 1: check token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Step 2: verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: get user from DB
    req.user = await User.findById(decoded.id).select("-password");

    // Step 4: pass control to next function
    next();
  } catch (error) {
    //  catch (error) {
    //   return res.status(401).json({ message: "Token failed" });
    // }
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Token failed",
    });
  }
};

module.exports = protect;
