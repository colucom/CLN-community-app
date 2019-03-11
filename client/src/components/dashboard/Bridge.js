import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {BigNumber} from 'bignumber.js'
import web3 from 'web3'
import FontAwesome from 'react-fontawesome'

import {balanceOfToken} from 'actions/accounts'
import {fetchHomeToken, fetchForeignBridge, fetchHomeBridge, deployBridge, transferToHome, transferToForeign, watchForeignBridge} from 'actions/bridge'
import {getBlockNumber} from 'actions/network'
import {getBalances} from 'selectors/accounts'
import {getBridgeStatus} from 'selectors/network'
import RopstenLogo from 'images/Ropsten.png'
import FuseLogo from 'images/fuseLogo.svg'

const NetworkLogo = ({network}) => network === 'fuse'
  ? <div className='dashboard-network-logo fuse-logo'><img src={FuseLogo} /></div>
  : <div className='dashboard-network-logo'><img src={RopstenLogo} /></div>

class Balance extends Component {
  componentDidMount () {
    this.props.balanceOfToken(this.props.tokenAddress, this.props.accountAddress, {networkBridge: this.props.bridgeSide.bridge})
  }

  componentDidUpdate (prevProps) {
    if (this.props.waitingForConfirmation === false && prevProps.waitingForConfirmation) {
      this.props.balanceOfToken(this.props.tokenAddress, this.props.accountAddress, {networkBridge: this.props.bridgeSide.bridge})
    }
  }

  render = () => <div className='dashboard-network-content'>
    <div className='dashboard-network-title'>{this.props.bridgeSide.network}</div>
    <NetworkLogo network={this.props.bridgeSide.network} />
    <div className='dashboard-network-text'>Balance</div>
    <div className='dashboard-network-balance balance-fuse'>
      <span>{new BigNumber(this.props.balances[this.props.tokenAddress]).div(1e18).toFormat(2, 1)} {this.props.token.symbol}</span>
    </div>
    <button className='dashboard-network-btn'>Show more</button>
  </div>
}

Balance.propTypes = {
  balanceOfToken: PropTypes.func.isRequired,
  tokenAddress: PropTypes.string.isRequired,
  accountAddress: PropTypes.string.isRequired,
  token: PropTypes.object,
  bridgeSide: PropTypes.object.isRequired
}

class Bridge extends Component {
  state = {
    transferToFuse: 0
  }

  componentDidMount () {
    this.props.fetchHomeToken(this.props.foreignTokenAddress)
    this.props.fetchHomeBridge(this.props.foreignTokenAddress)
    this.props.fetchForeignBridge(this.props.foreignTokenAddress)
    // this.props.watchForeignBridge('0xD25202eEECF55e8223bf4C3d9242118688ACFFB9', '3156000')
  }

  componentDidUpdate (prevProps) {
    if (this.props.waitingForConfirmation && prevProps.waitingForConfirmation) {
      if (this.props.bridgeStatus.to.bridge === 'home') {

      } else {
        this.props.watchForeignBridge(this.props.foreignBridgeAddress, this.props.receipt.blockNumber)
        console.log('SUBSCRIBE')
      }
    }
  }

  isOwner = () => this.props.accountAddress === this.props.token.owner

  setTransferToFuse = (e) => this.setState({ transferToFuse: e.target.value })

  handleTransfer = () => {
    const value = web3.utils.toWei(this.state.transferToFuse)
    if (this.props.bridgeStatus.to.bridge === 'home') {
      this.props.transferToHome(this.props.foreignTokenAddress, this.props.foreignBridgeAddress, value)
    } else {
      this.props.transferToForeign(this.props.homeTokenAddress, this.props.homeBridgeAddress, value)
    }
    this.props.getBlockNumber(this.props.bridgeStatus.to.network)
    this.props.getBlockNumber(this.props.bridgeStatus.from.network)
  }

  render = () => (<div className='dashboard-sidebar'>
    {(this.props.foreignTokenAddress && this.props.homeTokenAddress) ? <div className='dashboard-network'>
      <Balance
        balanceOfToken={this.props.balanceOfToken}
        tokenAddress={this.props.homeNetwork === this.props.bridgeStatus.from.network ? this.props.homeTokenAddress : this.props.foreignTokenAddress}
        accountAddress={this.props.accountAddress}
        token={this.props.token}
        balances={this.props.balances}
        bridgeSide={this.props.bridgeStatus.from}
        waitingForConfirmation={this.props.waitingForConfirmation}
      />
      <div className='dashboard-network-content network-arrow'>
        <FontAwesome name='long-arrow-alt-right' />
      </div>
      <Balance
        balanceOfToken={this.props.balanceOfToken}
        tokenAddress={this.props.homeNetwork === this.props.bridgeStatus.to.network ? this.props.homeTokenAddress : this.props.foreignTokenAddress}
        accountAddress={this.props.accountAddress}
        token={this.props.token}
        balances={this.props.balances}
        bridgeSide={this.props.bridgeStatus.to}
        waitingForConfirmation={this.props.waitingForConfirmation}
      />
    </div> : null}
    <div className='dashboard-transfer'>
      {
        this.props.foreignBridgeAddress ? (
          <div>
            <div className='dashboard-transfer-form'>
              <input value={this.state.transferToFuse} onChange={this.setTransferToFuse} />
              <div className='dashboard-transfer-form-currency'>{this.props.token.symbol}</div>
            </div>
            <button disabled={this.props.waitingForConfirmation}
              className='dashboard-transfer-btn' onClick={this.handleTransfer}>
              {this.props.waitingForConfirmation ? 'PENDING' : 'Transfer to fuse'}
            </button>
            {
              this.props.waitingForConfirmation
                ? <div>Confirmations: {this.props.confirmationNumber} / {this.props.confirmationsLimit} </div>
                : null
            }
          </div>
        ) : (
          <button className='dashboard-transfer-btn'
            disabled={!this.isOwner() || this.props.bridgeDeploying}
            onClick={() => this.props.deployBridge(this.props.foreignTokenAddress)}>
            {this.props.bridgeDeploying ? 'Pending' : 'Deploy Bridge'}
          </button>
        )
      }
    </div>
  </div>)
}

Bridge.propTypes = {
  accountAddress: PropTypes.string,
  homeTokenAddress: PropTypes.string,
  foreignTokenAddress: PropTypes.string,
  networkType: PropTypes.string
}

class BridgeContainer extends Component {
  isConfirmed = () => this.props.confirmationsLimit <= this.props.confirmationNumber
  isSent = () => this.props.transactionStatus === 'PENDING' || this.props.transactionStatus === 'SUCCESS'

  isWaitingForConfirmation = () => this.isSent() && !this.isConfirmed()

  render = () => {
    if (this.props.accountAddress && this.props.foreignTokenAddress) {
      return <Bridge
        {...this.props} waitingForConfirmation={this.isWaitingForConfirmation()} />
    } else {
      return null
    }
  }
}

const mapStateToProps = (state) => ({
  ...state.screens.bridge,
  homeNetwork: state.network.homeNetwork,
  foreignNetwork: state.network.foreignNetwork,
  bridgeStatus: getBridgeStatus(state),
  balances: getBalances(state)
})

const mapDispatchToProps = {
  balanceOfToken,
  deployBridge,
  fetchHomeBridge,
  fetchHomeToken,
  fetchForeignBridge,
  transferToHome,
  transferToForeign,
  watchForeignBridge,
  getBlockNumber
}

export default connect(mapStateToProps, mapDispatchToProps)(BridgeContainer)
