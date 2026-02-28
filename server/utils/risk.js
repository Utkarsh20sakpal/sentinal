const Visitor = require('../models/Visitor');

// Calculates risk based on recent activity
const calculateRiskScore = async (phone) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentVisits = await Visitor.find({
    phone,
    createdAt: { $gte: sevenDaysAgo },
  });

  const totalVisitsRecently = recentVisits.length;
  const rejections = recentVisits.filter((v) => v.status === 'rejected').length;

  let score = 0;

  if (totalVisitsRecently > 5) {
    score += 50;
  }

  if (rejections > 3) {
    score += 50;
  }

  // clamp 0-100
  if (score > 100) score = 100;

  return score;
};

module.exports = { calculateRiskScore };


