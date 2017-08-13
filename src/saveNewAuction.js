import Promise from 'bluebird'

export default function saveNewAuction({ event }) {
  return new Promise((resolve, reject) => {

    const { transactionHash, args } = event
    const { auctionRound, startDate, endDate, lockDate, tokensOffered, initialPrice } = args

    this.query({
      queryString: `
        CREATE TABLE IF NOT EXISTS auctions (
          txHash          CHARACTER(66),
          auctionRound    BIGINT NOT NULL DEFAULT 0 PRIMARY KEY,
          startDate       BIGINT NOT NULL DEFAULT 0,
          endDate         BIGINT NOT NULL DEFAULT 0,
          lockDate        BIGINT NOT NULL DEFAULT 0,
          tokensOffered   BIGINT NOT NULL DEFAULT 0,
          initialPrice    BIGINT NOT NULL DEFAULT 0
        ) ENGINE = INNODB;
      `,
    }).then(() => {
      return this.query({
        queryString: `
          INSERT INTO auctions (
            txHash,
            auctionRound,
            startDate,
            endDate,
            lockDate,
            tokensOffered,
            initialPrice
          ) VALUES (
            "${transactionHash}",
            ${auctionRound},
            ${startDate},
            ${endDate},
            ${lockDate},
            ${tokensOffered},
            ${initialPrice}
          );
        `
      })
    }).then(() => {
      return this.query({
        queryString: `
          SELECT * FROM auctions WHERE txHash = "${transactionHash}";
        `
      })
    }).then((result) => {
      resolve(result[0])
    }).catch((error) => {
      this.handleError({ error, method: 'saveNewAuction' })
    })
  })
}
