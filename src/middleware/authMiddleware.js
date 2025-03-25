// const jwt = require("jsonwebtoken");
// const { config } = require("../config/server.config"); // ✅ Apni secret key wahan store karein jahan aapke secrets hain

// const authenticateUser = (req, res, next) => {
//   try {
//     const { refreshToken } = req.cookies; // ✅ Token cookies se nikalain

//     if (!refreshToken) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized! Please log in",
//         data: null,
//       });
//     }

//     jwt.verify(refreshToken, config.secret, (err, decoded) => {
//       if (err) {
//         return res.status(403).json({
//           success: false,
//           message: "Invalid or expired token",
//           data: null,
//         });
//       }

//       req.user = decoded; // ✅ User data request mai inject kar dein
//       next(); // ✅ Agle middleware ya controller function pe move karein
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       data: null,
//     });
//   }
// };

// module.exports = authenticateUser;

const jwt = require("jsonwebtoken");
const { config } = require("../config/server.config");

const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // ✅ Bearer Token nikalna

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Please log in",
        data: null,
      });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
          data: null,
        });
      }

      req.user = decoded; // ✅ User data inject karna
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

module.exports = authenticateUser;
