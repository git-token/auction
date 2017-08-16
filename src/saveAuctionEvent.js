import Promise from 'bluebird'

export default function saveAuctionEvent({ event }) {
  return new Promise((resolve, reject) => {

    const { transactionHash, args: { auctionDetails } } = event
    console.log('auctionDetails', auctionDetails)
    const auctionRound     = auctionDetails[0].toNumber();
    const startDate        = auctionDetails[1].toNumber();
    const endDate          = auctionDetails[2].toNumber();
    const lockDate         = auctionDetails[3].toNumber();
    const tokensOffered    = auctionDetails[4].toNumber();
    const initialPrice     = auctionDetails[5].toNumber();
    const fundLimit        = auctionDetails[6].toNumber();
    const tokenLimitFactor = auctionDetails[7].toNumber();

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
