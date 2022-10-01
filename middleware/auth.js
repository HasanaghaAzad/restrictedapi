import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
const {verify} = jwt;

const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res) => {
  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader) {
    throw new Error('You need to have a token to access this resource!');
  }
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  try {
    verify(bearerToken, JWT_SECRET);
    res.token = bearerToken;
  } catch (err) {
    throw new Error('Invalid Token!');
  }
};

export default auth;
