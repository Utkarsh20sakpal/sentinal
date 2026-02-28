const bcrypt = require('bcrypt');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getExpiryTime = (minutes = 5) => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + minutes);
  return expires;
};

const hashOTP = async (otp) => {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
};

const verifyOTP = async (plainOtp, hashedOtp) => {
  return bcrypt.compare(plainOtp, hashedOtp);
};

module.exports = {
  generateOTP,
  getExpiryTime,
  hashOTP,
  verifyOTP,
};


