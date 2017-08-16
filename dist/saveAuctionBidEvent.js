'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = saveAuctionBidEvent;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveAuctionBidEvent(_ref) {
  var _this = this;

  var event = _ref.event;

  return new _bluebird2.default(function (resolve, reject) {
    var transactionHash = event.transactionHash,
        bidDetails = event.args.bidDetails;


    var auctionRound = bidDetails[0];
    var exRate = bidDetails[1];
    var wtdAvgExRate = bidDetails[2];
    var tokensTransferred = bidDetails[3];
    var ethPaid = bidDetails[4];
    var ethRefunded = bidDetails[5];
    var fundsCollected = bidDetails[6];
    var fundLimit = bidDetails[7];
    var date = bidDetails[8];

    _this.query({
      queryString: '\n        CREATE TABLE IF NOT EXISTS auctionBids (\n          txHash            CHARACTER(66) PRIMARY KEY,\n          auctionRound      BIGINT NOT NULL DEFAULT 0,\n          exRate            BIGINT NOT NULL DEFAULT 0,\n          wtdAvgExRate      BIGINT NOT NULL DEFAULT 0,\n          tokensTransferred BIGINT NOT NULL DEFAULT 0,\n          ethPaid           BIGINT NOT NULL DEFAULT 0,\n          ethRefunded       BIGINT NOT NULL DEFAULT 0,\n          fundsCollected    BIGINT NOT NULL DEFAULT 0,\n          fundLimit         BIGINT NOT NULL DEFAULT 0,\n          date              BIGINT NOT NULL DEFAULT 0\n        ) ENGINE = INNODB;\n      '
    }).then(function () {
      return _this.query({
        queryString: '\n          INSERT INTO auctionBids (\n            txHash            CHARACTER(66) PRIMARY KEY,\n            auctionRound      BIGINT NOT NULL DEFAULT 0,\n            exRate            BIGINT NOT NULL DEFAULT 0,\n            wtdAvgExRate      BIGINT NOT NULL DEFAULT 0,\n            tokensTransferred BIGINT NOT NULL DEFAULT 0,\n            ethPaid           BIGINT NOT NULL DEFAULT 0,\n            ethRefunded       BIGINT NOT NULL DEFAULT 0,\n            fundsCollected    BIGINT NOT NULL DEFAULT 0,\n            fundLimit         BIGINT NOT NULL DEFAULT 0,\n            date              BIGINT NOT NULL DEFAULT 0\n          ) VALUES (\n            "' + transactionHash + '",\n            ' + auctionRound + ',\n            ' + exRate + ',\n            ' + wtdAvgExRate + ',\n            ' + tokensTransferred + ',\n            ' + ethPaid + ',\n            ' + ethRefunded + ',\n            ' + fundsCollected + ',\n            ' + fundLimit + ',\n            ' + date + '\n          );\n        '
      });
    }).then(function () {
      return _this.query({
        queryString: '\n          SELECT * FROM auctionBids WHERE txHash = "' + transactionHash + '";\n        '
      });
    }).then(function (result) {
      resolve(result[0]);
    }).catch(function (error) {
      _this.handleError({ error: error, method: 'saveNewAuction' });
    });
  });
}