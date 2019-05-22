const tokenUtils = require('@utils/token')
const mongoose = require('mongoose')
const Token = mongoose.model('Token')
const config = require('config')
const { isZeroAddress } = require('@utils/network')

const token = mongoose.token

const tokenTypeEnumToString = {
  0: 'basic',
  1: 'mintableBurnable'
}

const handleTokenCreatedEvent = async (event) => {
  const eventArgs = event.returnValues
  const address = eventArgs.token

  const tokenData = {
    address,
    factoryAddress: event.address,
    blockNumber: event.blockNumber,
    owner: eventArgs.issuer,
    tokenType: tokenTypeEnumToString[eventArgs.tokenType],
    networkType: config.get('network.foreign.name')
  }

  const fetchedTokenData = await tokenUtils.fetchTokenData(address, { tokenURI: true })

  return token.create({ ...tokenData, ...fetchedTokenData })
}

const handleOwnershipTransferredEvent = async (event) => {
  const eventArgs = event.returnValues
  const { address } = event
  const owner = eventArgs.newOwner

  return Token.updateOne({ address, networkType: config.get('network.home.name') }, { owner })
}

const handleTransferEvent = (event) => {
  const tokenAddress = event.address
  const { from, to, value } = event.returnValues
  if (isZeroAddress(from)) {
    return token.mintTokens(tokenAddress, value)
  } else if (isZeroAddress(to)) {
    return token.burnTokens(tokenAddress, value)
  }
  return Promise.resolve()
}

module.exports = {
  handleTokenCreatedEvent,
  handleTransferEvent,
  handleOwnershipTransferredEvent
}
