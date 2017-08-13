const GitTokenAuction = require('../dist/index').default
const config = require('./config')
const { mysqlOpts, web3Provider, contractAddress } = config
const processor = new GitTokenAuction({ })
