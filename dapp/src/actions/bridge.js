import { createRequestTypes, createTransactionRequestTypes, requestAction } from './utils'

export const entityName = 'bridges'

export const WATCH_COMMUNITY_DATA = createRequestTypes('WATCH_COMMUNITY_DATA')

export const DEPLOY_BRIDGE = createTransactionRequestTypes('DEPLOY_BRIDGE')
export const TRANSFER_TO_HOME = createTransactionRequestTypes('TRANSFER_TO_HOME')
export const TRANSFER_TO_FOREIGN = createTransactionRequestTypes('TRANSFER_TO_FOREIGN')

export const WATCH_FOREIGN_BRIDGE = createTransactionRequestTypes('WATCH_FOREIGN_BRIDGE')
export const WATCH_HOME_BRIDGE = createTransactionRequestTypes('WATCH_HOME_BRIDGE')

export const deployBridge = (foreignTokenAddress) => requestAction(DEPLOY_BRIDGE, { foreignTokenAddress })
export const transferToHome = (foreignTokenAddress, foreignBridgeAddress, value) => requestAction(TRANSFER_TO_HOME, { foreignTokenAddress, foreignBridgeAddress, value, confirmationsLimit: CONFIG.web3.bridge.confirmations.foreign })
export const transferToForeign = (homeTokenAddress, homeBridgeAddress, value) => requestAction(TRANSFER_TO_FOREIGN, { homeTokenAddress, homeBridgeAddress, value, confirmationsLimit: CONFIG.web3.bridge.confirmations.home })

export const watchForeignBridge = (foreignBridgeAddress, transactionHash) => requestAction(WATCH_FOREIGN_BRIDGE, { foreignBridgeAddress, transactionHash })
export const watchHomeBridge = (homeBridgeAddress, transactionHash) => requestAction(WATCH_HOME_BRIDGE, { homeBridgeAddress, transactionHash })
