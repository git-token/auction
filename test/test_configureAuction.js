
const Promise =require('bluebird')
const fork = require('child_process').fork
const config = require('./config')
const auction = fork('./example/processor.js')

auction.send(JSON.stringify({ event: 'configure', data: config }))

auction.on('message', (msg) => {
  const data = JSON.stringify(JSON.parse(msg), null, 2);
  console.log("Received Data:", data)
})
