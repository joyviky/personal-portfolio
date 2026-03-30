const Portfolio = require('../models/Portfolio');

const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      portfolio = await Portfolio.create({ data: {} });
    }

    res.json(portfolio.data);
  } catch (error) {
    console.error('Error in getPortfolio:', error);
    res.status(500).json({ message: error.message });
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const newData = req.body;
    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      portfolio = new Portfolio({ data: newData });
    } else {
      portfolio.data = newData;
    }

    await portfolio.save();
    res.json(portfolio.data);
  } catch (error) {
    console.error('Error in updatePortfolio:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio, updatePortfolio };
