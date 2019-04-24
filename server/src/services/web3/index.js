const Web3 = require('web3')
const config = require('config')

const web3 = new Web3(config.get('web3.provider'))

module.exports = web3
