'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = updateAuctionHistory;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateAuctionHistory(_ref) {
  var _this = this;

  var bidDetails = _ref.bidDetails;

  return new _bluebird2.default(function (resolve, reject) {
    var decimals = _this.contractDetails.decimals;
    var auctionRound = bidDetails.auctionRound;


    _this.query({
      queryString: '\n        CREATE TABLE IF NOT EXISTS auction_history (\n          auctionRound      BIGINT NOT NULL DEFAULT 0 PRIMARY KEY,\n          startDate         BIGINT NOT NULL DEFAULT 0,\n          endDate           BIGINT NOT NULL DEFAULT 0,\n          lockDate          BIGINT NOT NULL DEFAULT 0,\n          initialExRate     BIGINT NOT NULL DEFAULT 0,\n          wtdAvgExRate      BIGINT NOT NULL DEFAULT 0,\n          tokensOffered     BIGINT NOT NULL DEFAULT 0,\n          tokensTransferred BIGINT NOT NULL DEFAULT 0,\n          fundsCollected    REAL,\n          fundLimit         REAL\n        );\n      '
    }).then(function () {
      return _this.query({
        queryString: '\n          INSERT INTO auction_history (\n            auctionRound,\n            startDate,\n            endDate,\n            lockDate,\n            initialExRate,\n            wtdAvgExRate,\n            tokensOffered,\n            tokensTransferred,\n            fundsCollected,\n            fundLimit\n          ) VALUES (\n            ' + auctionRound + ',\n            (SELECT startDate from auctions WHERE auctionRound = ' + auctionRound + '),\n            (SELECT endDate from auctions WHERE auctionRound = ' + auctionRound + '),\n            (SELECT lockDate from auctions WHERE auctionRound = ' + auctionRound + '),\n            (SELECT initialPrice from auctions WHERE auctionRound = ' + auctionRound + '),\n            (SELECT wtdAvgExRate from auction_bids where auctionRound = ' + auctionRound + ' ORDER BY date DESC LIMIT 1),\n            (SELECT tokensOffered from auctions WHERE auctionRound = ' + auctionRound + '),\n            (SELECT sum(tokensTransferred) from auctions WHERE auctionRound = ' + auctionRound + '),\n            (SELECT fundsCollected from auction_bids where auctionRound = ' + auctionRound + ' ORDER BY date DESC LIMIT 1),\n            (SELECT fundLimit from auctions WHERE auctionRound = ' + auctionRound + ')\n          ) ON DUPLICATE KEY UPDATE\n            wtdAvgExRate=VALUES(wtdAvgExRate),\n            tokensTransferred=VALUES(tokensTransferred),\n            fundsCollected=VALUES(fundsCollected);\n        '
      });
    }).then(function () {
      return _this.query({
        queryString: '\n          SELECT * FROM auction_history;\n        '
      });
    }).then(function (result) {
      resolve(result[0]);
    }).catch(function (error) {
      _this.handleError({ error: error, method: 'updateAuctionHistory' });
    });
  });
}