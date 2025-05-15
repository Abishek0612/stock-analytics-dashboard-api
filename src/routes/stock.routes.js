const express = require("express");
const {
  getStockData,
  searchStocks,
  getQuote,
} = require("../controllers/stock.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/data", getStockData);
router.get("/search", searchStocks);
router.get("/quote/:symbol", getQuote);

module.exports = router;
