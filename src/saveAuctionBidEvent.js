import Promise from 'bluebird'

export default function saveAuctionBidEvent({ event }) {
  return new Promise((resolve, reject) => {
    const { decimals } = this.contractDetails
    const { transactionHash, args: { bidDetails } } = event

    const auctionRound      = bidDetails[0].toNumber();
    const exRate            = bidDetails[1].toNumber();
    const wtdAvgExRate      = bidDetails[2].toNumber();
    const tokensTransferred = bidDetails[3].toNumber();
    const ethPaid           = bidDetails[4].toNumber() / 1e18;
    const ethRefunded       = bidDetails[5].toNumber() / 1e18;
    const fundsCollected    = bidDetails[6].toNumber() / 1e18;
    const fundLimit         = bidDetails[7].toNumber() / 1e18;
    const date              = bidDetails[8].toNumber();

    this.query({
      queryString: `
        CREATE TABLE IF NOT EXISTS auction_bids (
          txHash            CHARACTER(66) PRIMARY KEY,
          auctionRound      BIGINT NOT NULL DEFAULT 0,
          exRate            BIGINT NOT NULL DEFAULT 0,
          wtdAvgExRate      BIGINT NOT NULL DEFAULT 0,
          tokensTransferred BIGINT NOT NULL DEFAULT 0,
          ethPaid           REAL,
          ethRefunded       REAL,
          fundsCollected    REAL,
          fundLimit         REAL,
          date              BIGINT NOT NULL DEFAULT 0
        );
      `,
    }).then(() => {
      return this.query({
        queryString: `
          INSERT INTO auction_bids (
            txHash,
            auctionRound,
            exRate,
            wtdAvgExRate,
            tokensTransferred,
            ethPaid,
            ethRefunded,
            fundsCollected,
            fundLimit,
            date
          ) VALUES (
            "${transactionHash}",
            ${auctionRound},
            ${exRate},
            ${wtdAvgExRate},
            ${tokensTransferred},
            ${ethPaid},
            ${ethRefunded},
            ${fundsCollected},
            ${fundLimit},
            ${date}
          );
        `
      })
    }).then(() => {
      return this.query({
        queryString: `
          SELECT * FROM auction_bids WHERE txHash = "${transactionHash}";
        `
      })
    }).then((result) => {
      resolve(result[0])
    }).catch((error) => {
      this.handleError({ error, method: 'saveNewAuction' })
    })
  })
}
