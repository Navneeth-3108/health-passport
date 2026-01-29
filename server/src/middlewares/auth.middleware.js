export const isAuthenticated = (req, res, next) => {
  if (req.user && req.user._id) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized. Please log in." });
};