import Promise from 'bluebird'

export default function saveAuctionEvent({ event }) {
  return new Promise((resolve, reject) => {

    const { transactionHash, args: { auctionDetails } } = event

    const auctionRound     = auctionDetails[0];
    const startDate        = auctionDetails[1];
    const endDate          = auctionDetails[2];
    const lockDate         = auctionDetails[3];
    const tokensOffered    = auctionDetails[4];
    const initialPrice     = auctionDetails[5];
    const fundLimit        = auctionDetails[6];
    const tokenLimitFactor = auctionDetails[7];

    this.query({
      queryString: `
        CREATE TABLE IF NOT EXISTS auctions (
          txHash           CHARACTER(66),
          auctionRound     BIGINT NOT NULL DEFAULT 0 PRIMARY KEY,
          startDate        BIGINT NOT NULL DEFAULT 0,
          endDate          BIGINT NOT NULL DEFAULT 0,
          lockDate         BIGINT NOT NULL DEFAULT 0,
          tokensOffered    BIGINT NOT NULL DEFAULT 0,
          initialPrice     BIGINT NOT NULL DEFAULT 0,
          fundLimit        BIGINT NOT NULL DEFAULT 0,
          tokenLimitFactor BIGINT NOT NULL DEFAULT 0
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
            initialPrice,
            fundLimit,
            tokenLimitFactor
          ) VALUES (
            "${transactionHash}",
            ${auctionRound},
            ${startDate},
            ${endDate},
            ${lockDate},
            ${tokensOffered},
            ${initialPrice},
            ${fundLimit},
            ${tokenLimitFactor}
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
