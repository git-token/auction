import GitTokenContract from 'gittoken-contracts/build/contracts/GitToken.json'
import Promise, { join, promisifyAll } from 'bluebird'
import Web3 from 'web3'
import mysql from 'mysql'

import saveNewAuctionEvent from './saveNewAuctionEvent'

// const { abi } = JSON.parse(GitTokenContract)

export default class GitTokenAnalytics {
  /**
   * GitToken Analytics Constructor Options
   * @param  {Object} options { mysql: { ...} }
   */
  constructor(options) {
    this.listen()
    const { web3Provider, mysqlOpts, contractAddress, abi } = options
    this.contractDetails = {}

    this.saveNewAuctionEvent = saveNewAuctionEvent.bind(this)

    if (web3Provider && mysqlOpts && contractAddress && abi) {
      this.configure({ web3Provider, mysqlOpts, contractAddress, abi }).then((configured) => {
        console.log('GitToken Analytics Processor Configured')
        console.log(JSON.stringify(configured, null, 2))
        this._watchInitializeAuctionEvents()
      })
    } else {
      console.log(`GitToken Auction Processor listening for 'configure' event.`)
    }
  }

  configure({ web3Provider, mysqlOpts, contractAddress, abi }) {
    return new Promise((resolve, reject) => {
      this.establishMySqlConnection({ mysqlOpts }).then(() => {
        return this.configureWeb3Provider({ web3Provider })
      }).then(() => {
        return this.configureContract({ abi, contractAddress })
      }).then((contract) => {
        return this.getContractDetails()
      }).then(() => {
        // console.log('this.contractDetails', this.contractDetails)
        resolve({
          contractDetails: this.contractDetails
        })
      }).catch((error) => {
        console.log('error', error)
        this.handleError({ error, method: 'configure' })
      })
    })
  }

  establishMySqlConnection({ mysqlOpts }) {
    return new Promise((resolve, reject) => {
      try {
        this.mysql = mysql.createConnection({ ...mysqlOpts })
        this.mysql.connect()
        resolve({ mysql: this.mysql })
      } catch (error) {
        this.handleError({ error, method: 'establishMySqlConnection' })
      }
    })
  }

  query({ queryString, queryObject=[] }) {
    return new Promise((resolve, reject) => {
      /* TODO: Check mysql docs for second param (queryObject) */
      this.mysql.query(queryString, (error, result) => {
        if (error) { this.handleError({ error, method: 'query' }) }
        resolve(result)
      })
    })
  }

  configureWeb3Provider({ web3Provider }) {
    return new Promise((resolve, reject) => {
      try {
        console.log('web3Provider', web3Provider)
        this.web3 = new Web3(new Web3.providers.HttpProvider(web3Provider))
        this.eth = promisifyAll(this.web3.eth)
        resolve({ web3: this.web3, eth: this.eth })
      } catch (error) {
        this.handleError({ error, method: 'configureWeb3Provider' })
      }
    })
  }

  configureContract({ abi, contractAddress }) {
    return new Promise((resolve, reject) => {
      this.contract = this.web3.eth.contract(abi).at(contractAddress)
      Promise.resolve(Object.keys(this.contract)).map((method) => {
        if (this.contract[method] && this.contract[method]['request']) {
          this.contract[method] = promisifyAll(this.contract[method])
        }
      }).then(() => {
        resolve(this.contract)
      }).catch((error) => {
        this.handleError({ error, method: 'configureContract' })
      })
    })
  }

  _watchInitializeAuctionEvents() {
    const events = this.contract.NewAuction({}, { fromBlock: 0, toBlock: 'latest' })
    events.watch((error, result) => {
      if (error) { this.handleError({ error, method: '_watchInitializeAuctionEvents' }) }
      console.log('_watchInitializeAuctionEvents::result', result)
      this.saveNewAuctionEvent({ event: result }).then((auctionDetails) => {
        process.send(JSON.stringify({
          event: 'broadcast_auction_data',
          message: `New Auction Event.`,
          data: auctionDetails
        }))
      })
    })
  }

  getContractDetails() {
    return new Promise((resolve, reject) => {
      join(
        this.contract.name.callAsync(),
        this.contract.symbol.callAsync(),
        this.contract.decimals.callAsync(),
        this.contract.organization.callAsync()
      ).then((data) => {
        // console.log('getContractDetails::data', data)
        try {
          this.contractDetails = {
            name: data[0],
            symbol: data[1],
            decimals: data[2].toNumber(),
            organization: data[3],
            address: this.contract.address
          }
          resolve({ contractDetails: this.contractDetails })
        } catch (error) {
          throw error
        }
      }).catch((error) => {
        console.log('contractDetails::error', error)
        this.handleError({ error, method: 'getContractDetails' })
      })
    })
  }

  listen() {
    console.log('GitToken Auction Processor Listening on Separate Process: ', process.pid)
    process.on('message', (msg) => {
      // console.log('msg', msg)
      const { event, data } = JSON.parse(msg)
      switch(event) {
        case 'configure':
          const { web3Provider, mysqlOpts, contractAddress, abi } = data
          // console.log('listen::contractAddress, abi', contractAddress, abi)
          this.configure({
            web3Provider,
            mysqlOpts,
            contractAddress,
            abi
          }).then((configured) => {
            process.send(JSON.stringify({ event, data: configured, message: 'GitToken Auction Processor Configured' }))
            this._watchInitializeAuctionEvents()
          })
          break;
        case 'contract_details':
          this.getContractDetails().then((result) => {
            process.send(JSON.stringify({ event, data: result, message: 'Contract details retrieved.' }))
          })
          break;
        default:
          process.send(JSON.stringify({
            message: 'Unhandled Auction Event',
            data: [],
            event: 'error'
          }))
      }
    })
  }

  handleError({ error, method }) {
    /**
     * TODO Add switch case handler based on error codes, etc.
     * Determine when to send back message to parent process
     */
    console.log('handleError::method', method)
    console.log(error)
  }
}
