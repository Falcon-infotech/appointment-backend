import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

dotenv.config();

export const authenticate = async(req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({
    success: false,
    statusCode: 401,
    message: 'Access denied. No token provided.'
  });

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = verified;
    next();
  } catch (err) {
    if (err) {
      console.log("error in authenticate ",err)
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'TokenExpired' }); 
      }
      return res.status(403).json({      
      success: false,
      statusCode: 403,
      message: 'InvalidToken' });
    }
  }
};

export const isVerifiedPass = async (req, res, next) => {

      const { email, password } = req.body;
        const user = await userModel.findOne({ email })

   if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid credentials'
      });
    }


next()

}
