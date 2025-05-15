const NodeCache = require("node-cache");
const yahooFinance = require("yahoo-finance2").default;

const stockCache = new NodeCache({ stdTTL: 300 });

const REFERENCE_DATE = new Date("2023-01-15");
console.log(
  `Using fixed reference date: ${REFERENCE_DATE.toISOString().split("T")[0]}`
);

/**
 * Helper function to determine interval based on timeframe
 */
const getYahooInterval = (timeframe) => {
  switch (timeframe) {
    case "1D":
      return "1d";
    case "1W":
      return "1d";
    case "1M":
      return "1d";
    case "3M":
      return "1d";
    case "1Y":
      return "1d";
    case "YTD":
      return "1d";
    case "MTD":
      return "1d";
    default:
      return "1d";
  }
};

const getDateRange = (timeframe) => {
  const refDate = new Date(REFERENCE_DATE);

  const end = refDate.toISOString().split("T")[0];
  let start;

  switch (timeframe) {
    case "1D":
      const threeDaysAgo = new Date(refDate);
      threeDaysAgo.setDate(refDate.getDate() - 3);
      start = threeDaysAgo.toISOString().split("T")[0];
      break;
    case "1W":
      const oneWeekAgo = new Date(refDate);
      oneWeekAgo.setDate(refDate.getDate() - 7);
      start = oneWeekAgo.toISOString().split("T")[0];
      break;
    case "1M":
      const oneMonthAgo = new Date(refDate);
      oneMonthAgo.setMonth(refDate.getMonth() - 1);
      start = oneMonthAgo.toISOString().split("T")[0];
      break;
    case "3M":
      const threeMonthsAgo = new Date(refDate);
      threeMonthsAgo.setMonth(refDate.getMonth() - 3);
      start = threeMonthsAgo.toISOString().split("T")[0];
      break;
    case "1Y":
      const oneYearAgo = new Date(refDate);
      oneYearAgo.setFullYear(refDate.getFullYear() - 1);
      start = oneYearAgo.toISOString().split("T")[0];
      break;
    case "YTD":
      start = `${refDate.getFullYear()}-01-01`;
      break;
    case "MTD":
      start = `${refDate.getFullYear()}-${(refDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-01`;
      break;
    case "custom":
      const customDefault = new Date(refDate);
      customDefault.setMonth(refDate.getMonth() - 1);
      start = customDefault.toISOString().split("T")[0];
      break;
    default:
      const defaultOneMonthAgo = new Date(refDate);
      defaultOneMonthAgo.setMonth(refDate.getMonth() - 1);
      start = defaultOneMonthAgo.toISOString().split("T")[0];
  }

  console.log(
    `Using fixed date range: start=${start}, end=${end}, timeframe=${timeframe}`
  );
  return { start, end };
};

function generateSampleStockData(ticker, startDate, endDate) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  console.log(
    `Generating sample data for ${ticker} from ${startDate} to ${endDate}`
  );

  let basePrice;
  switch (ticker.toUpperCase()) {
    case "AAPL":
      basePrice = 145.85;
      break;
    case "MSFT":
      basePrice = 265.3;
      break;
    case "GOOGL":
      basePrice = 105.55;
      break;
    case "AMZN":
      basePrice = 98.75;
      break;
    case "META":
      basePrice = 232.8;
      break;
    case "TSLA":
      basePrice = 192.5;
      break;
    default:
      basePrice = 100 + Math.random() * 200;
  }

  const tickerSeed = ticker
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let seed = tickerSeed;
  let currentPrice = basePrice;

  let currentDate = new Date(start);
  while (currentDate <= end) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      seed++;
      const volatility = 0.02;
      let changePercent = (random(seed) - 0.48) * volatility;

      const dailyOpen = currentPrice;
      const dailyClose = dailyOpen * (1 + changePercent);
      const dailyHigh =
        Math.max(dailyOpen, dailyClose) * (1 + random(seed + 0.1) * 0.01);
      const dailyLow =
        Math.min(dailyOpen, dailyClose) * (1 - random(seed + 0.2) * 0.01);
      const volume = Math.floor(random(seed + 0.3) * 10000000) + 1000000;

      data.push({
        date: new Date(currentDate).toISOString(),
        open: parseFloat(dailyOpen.toFixed(2)),
        high: parseFloat(dailyHigh.toFixed(2)),
        low: parseFloat(dailyLow.toFixed(2)),
        close: parseFloat(dailyClose.toFixed(2)),
        volume: volume,
        adjClose: parseFloat(dailyClose.toFixed(2)),
      });

      currentPrice = dailyClose;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Generated ${data.length} sample data points for ${ticker}`);
  return data;
}

/**
 * Main handler for getting stock data
 */
exports.getStockData = async (req, res) => {
  try {
    const { tickers, timeframe } = req.query;

    if (!tickers) {
      return res.status(400).json({
        status: "fail",
        message: "No stock tickers provided",
      });
    }

    const tickerArray = tickers.split(",");
    const interval = getYahooInterval(timeframe);

    const { start, end } = getDateRange(timeframe);

    const responseData = {};

    await Promise.all(
      tickerArray.map(async (ticker) => {
        const cacheKey = `${ticker}_${timeframe}_${start}_${end}`;

        const cachedData = stockCache.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached data for ${ticker}`);
          responseData[ticker] = cachedData;
          return;
        }

        console.log(`Generating sample data for ${ticker}`);
        const sampleData = generateSampleStockData(ticker, start, end);

        stockCache.set(cacheKey, sampleData);
        responseData[ticker] = sampleData;
      })
    );

    res.status(200).json({
      status: "success",
      data: responseData,
    });
  } catch (error) {
    console.error("Stock data API error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch stock data. Please try again later.",
    });
  }
};

// List of popular stocks
const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "EQUITY" },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    type: "EQUITY",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    exchange: "NASDAQ",
    type: "EQUITY",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    type: "EQUITY",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    exchange: "NASDAQ",
    type: "EQUITY",
  },
  { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", type: "EQUITY" },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    type: "EQUITY",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    exchange: "NYSE",
    type: "EQUITY",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    exchange: "NYSE",
    type: "EQUITY",
  },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE", type: "EQUITY" },
];

// Search for stocks by keyword

exports.searchStocks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: "fail",
        message: "No search query provided",
      });
    }

    const cacheKey = `search_${query}`;

    const cachedResults = stockCache.get(cacheKey);
    if (cachedResults) {
      return res.status(200).json({
        status: "success",
        data: cachedResults,
      });
    }

    console.log(`Searching for stocks matching: ${query}`);
    let results = popularStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
      console.log("No matching stocks found, returning popular stocks");
      results = popularStocks.slice(0, 3);
    }

    stockCache.set(cacheKey, results, 120);

    res.status(200).json({
      status: "success",
      data: results,
    });
  } catch (error) {
    console.error("Stock search API error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to search stocks. Please try again.",
    });
  }
};

function generateSampleQuote(symbol) {
  // Base prices for popular stocks
  let basePrice;
  switch (symbol.toUpperCase()) {
    case "AAPL":
      basePrice = 145.85;
      break;
    case "MSFT":
      basePrice = 265.3;
      break;
    case "GOOGL":
      basePrice = 105.55;
      break;
    case "AMZN":
      basePrice = 98.75;
      break;
    case "META":
      basePrice = 232.8;
      break;
    case "TSLA":
      basePrice = 192.5;
      break;
    default:
      basePrice = 100 + Math.random() * 200;
  }

  const changePercent = (Math.random() - 0.4) * 3;
  const change = basePrice * (changePercent / 100);
  const price = basePrice + change;
  const open = basePrice * (1 + (Math.random() - 0.5) * 0.01);
  const dayHigh = price * (1 + Math.random() * 0.01);
  const dayLow = price * (1 - Math.random() * 0.01);
  const volume = Math.floor(Math.random() * 10000000) + 1000000;
  const marketCap = Math.floor(
    price * (Math.random() * 1000000000 + 5000000000)
  );

  const stockNames = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    META: "Meta Platforms Inc.",
    TSLA: "Tesla, Inc.",
    NVDA: "NVIDIA Corporation",
    JPM: "JPMorgan Chase & Co.",
    JNJ: "Johnson & Johnson",
    V: "Visa Inc.",
  };

  return {
    symbol: symbol.toUpperCase(),
    shortName:
      stockNames[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`,
    regularMarketPrice: parseFloat(price.toFixed(2)),
    regularMarketChange: parseFloat(change.toFixed(2)),
    regularMarketChangePercent: parseFloat(changePercent.toFixed(2)),
    regularMarketOpen: parseFloat(open.toFixed(2)),
    regularMarketDayHigh: parseFloat(dayHigh.toFixed(2)),
    regularMarketDayLow: parseFloat(dayLow.toFixed(2)),
    regularMarketVolume: volume,
    marketCap: marketCap,
  };
}

exports.getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        status: "fail",
        message: "No stock symbol provided",
      });
    }

    const cacheKey = `quote_${symbol}_${Date.now().toString().substring(0, 7)}`;

    const cachedQuote = stockCache.get(cacheKey);
    if (cachedQuote) {
      return res.status(200).json({
        status: "success",
        data: cachedQuote,
      });
    }

    console.log(`Generating sample quote for ${symbol}`);
    const quote = generateSampleQuote(symbol);

    stockCache.set(cacheKey, quote, 60);

    res.status(200).json({
      status: "success",
      data: quote,
    });
  } catch (error) {
    console.error("Stock quote API error:", error);
    const sampleQuote = generateSampleQuote(req.params.symbol);
    res.status(200).json({
      status: "success",
      data: sampleQuote,
    });
  }
};
