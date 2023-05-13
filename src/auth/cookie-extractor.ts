export const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.refreshToken;
  }
  return token;
};
