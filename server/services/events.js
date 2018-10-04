const Web3 = require('web3')
const config = require('config')
const websocketProviderUri = config.get('web3.websocketProvider')
const CurrencyFactoryAbi = require('../constants/abi/CurrencyFactory')
const websocketProvider = new Web3.providers.WebsocketProvider(websocketProviderUri)
const eventUtils = require('../utils/events')

const getAddresses = require('../utils/network').getAddresses
const addresses = getAddresses()

const web3 = new Web3(websocketProvider)
const CurrencyFactoryContract = new web3.eth.Contract(CurrencyFactoryAbi, addresses.CurrencyFactory)

const eventCallback = async (error, event) => {
  if (error) {
    console.error(error)
    return
  }
  eventUtils.processTokenCreatedEvent(event)
}

const eventsCallback = (error, events) => {
  if (error) {
    console.error(error)
    return
  }
  events.forEach((event) => eventCallback(error, event))
}

const lastBlockNumber = eventUtils.getLastBlockNumber()

CurrencyFactoryContract.events.TokenCreated(eventCallback)

CurrencyFactoryContract.getPastEvents('TokenCreated', {fromBlock: lastBlockNumber, toBlock: 'latest'}, eventsCallback)
