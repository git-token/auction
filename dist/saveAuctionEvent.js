'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = saveAuctionEvent;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveAuctionEvent(_ref) {
  var _this = this;

  var event = _ref.event;

  return new _bluebird2.default(function (resolve, reject) {
    var decimals = _this.contractDetails.decimals;
    var transactionHash = event.transactionHash,
        auctionDetails = event.args.auctionDetails;

    console.log('saveAuctionEvent::auctionDetails', auctionDetails);
    var auctionRound = auctionDetails[0].toNumber();
    var startDate = auctionDetails[1].toNumber();
    var endDate = auctionDetails[2].toNumber();
    var lockDate = auctionDetails[3].toNumber();
    var tokensOffered = auctionDetails[4].toNumber();
    var initialPrice = auctionDetails[5].toNumber();
    var fundLimit = auctionDetails[6].toNumber() / Math.pow(10, decimals);
    var tokenLimitFactor = auctionDetails[7].toNumber();

    _this.query({
      queryString: '\n        CREATE TABLE IF NOT EXISTS auctions (\n          txHash           CHARACTER(66),\n          auctionRound     BIGINT NOT NULL DEFAULT 0 PRIMARY KEY,\n          startDate        BIGINT NOT NULL DEFAULT 0,\n          endDate          BIGINT NOT NULL DEFAULT 0,\n          lockDate         BIGINT NOT NULL DEFAULT 0,\n          tokensOffered    BIGINT NOT NULL DEFAULT 0,\n          initialPrice     BIGINT NOT NULL DEFAULT 0,\n          fundLimit        BIGINT NOT NULL DEFAULT 0,\n          tokenLimitFactor BIGINT NOT NULL DEFAULT 0\n        );\n      '
    }).then(function () {
      return _this.query({
        queryString: '\n          INSERT INTO auctions (\n            txHash,\n            auctionRound,\n            startDate,\n            endDate,\n            lockDate,\n            tokensOffered,\n            initialPrice,\n            fundLimit,\n            tokenLimitFactor\n          ) VALUES (\n            "' + transactionHash + '",\n            ' + auctionRound + ',\n            ' + startDate + ',\n            ' + endDate + ',\n            ' + lockDate + ',\n            ' + tokensOffered + ',\n            ' + initialPrice + ',\n            ' + fundLimit + ',\n            ' + tokenLimitFactor + '\n          );\n        '
      });
    }).then(function () {
      return _this.query({
        queryString: '\n          SELECT * FROM auctions WHERE txHash = "' + transactionHash + '";\n        '
      });
    }).then(function (result) {
      console.log('saveAuctionEvent::result', result);
      resolve(result[0]);
    }).catch(function (error) {

      _this.handleError({ error: error, method: 'saveAuctionEvent' });
    });
  });
}