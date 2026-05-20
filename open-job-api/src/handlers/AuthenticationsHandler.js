const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsersRepository = require('../repositories/UsersRepository');
const AuthenticationsRepository = require('../repositories/AuthenticationsRepository');
const { AuthenticationError } = require('../utils/errors');

const AuthenticationsHandler = {
  async login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await UsersRepository.findByEmail(email);
    if (!user) throw new AuthenticationError('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AuthenticationError('Invalid email or password');

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: '7d' }
    );

    await AuthenticationsRepository.addRefreshToken(refreshToken);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
},

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await AuthenticationsRepository.verifyRefreshToken(refreshToken);

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      } catch {
        throw new AuthenticationError('Invalid refresh token');
      }

      const user = await UsersRepository.findById(decoded.id);
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: '3h' }
      );

      return res.status(200).json({
        status: 'success',
        message: 'Access token refreshed',
        data: { accessToken },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await AuthenticationsRepository.verifyRefreshToken(refreshToken);
      await AuthenticationsRepository.deleteRefreshToken(refreshToken);

      return res.status(200).json({
        status: 'success',
        message: 'Logout successful',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthenticationsHandler;