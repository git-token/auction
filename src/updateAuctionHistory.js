import Promise from 'bluebird'

export default function updateAuctionHistory({ auctionRound }) {
  return new Promise((resolve, reject) => {
    const { decimals } = this.contractDetails

    this.query({
      queryString: `
        CREATE TABLE IF NOT EXISTS auction_history (
          auctionRound      BIGINT NOT NULL DEFAULT 0 PRIMARY KEY,
          startDate         BIGINT NOT NULL DEFAULT 0,
          endDate           BIGINT NOT NULL DEFAULT 0,
          lockDate          BIGINT NOT NULL DEFAULT 0,
          initialExRate     BIGINT NOT NULL DEFAULT 0,
          wtdAvgExRate      BIGINT NOT NULL DEFAULT 0,
          tokensOffered     BIGINT NOT NULL DEFAULT 0,
          tokensTransferred BIGINT NOT NULL DEFAULT 0,
          fundsCollected    REAL,
          fundLimit         REAL
        );
      `,
    }).then(() => {
      return this.query({
        queryString: `
          INSERT INTO auction_history (
            auctionRound,
            startDate,
            endDate,
            lockDate,
            initialExRate,
            wtdAvgExRate,
            tokensOffered,
            tokensTransferred,
            fundsCollected,
            fundLimit
          ) VALUES (
            ${auctionRound},
            (SELECT startDate from auctions WHERE auctionRound = ${auctionRound}),
            (SELECT endDate from auctions WHERE auctionRound = ${auctionRound}),
            (SELECT lockDate from auctions WHERE auctionRound = ${auctionRound}),
            (SELECT initialPrice from auctions WHERE auctionRound = ${auctionRound}),
            (SELECT wtdAvgExRate from auction_bids where auctionRound = ${auctionRound} ORDER BY date DESC LIMIT 1),
            (SELECT tokensOffered from auctions WHERE auctionRound = ${auctionRound}),
            (SELECT sum(tokensTransferred) from auction_bids WHERE auctionRound = ${auctionRound}),
            (SELECT fundsCollected from auction_bids where auctionRound = ${auctionRound} ORDER BY date DESC LIMIT 1),
            (SELECT fundLimit from auctions WHERE auctionRound = ${auctionRound})
          ) ON DUPLICATE KEY UPDATE
            wtdAvgExRate=VALUES(wtdAvgExRate),
            tokensTransferred=VALUES(tokensTransferred),
            fundsCollected=VALUES(fundsCollected);
        `
      })
    }).then(() => {
      return this.query({
        queryString: `
          SELECT * FROM auction_history;
        `
      })
    }).then((result) => {
      resolve(result[0])
    }).catch((error) => {
      this.handleError({ error, method: 'updateAuctionHistory' })
    })
  })
}
