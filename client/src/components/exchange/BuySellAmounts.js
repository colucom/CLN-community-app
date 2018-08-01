import React, {Component, Fragment} from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import * as uiActions from 'actions/ui'
import * as marketMakerActions from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import { buySell } from 'constants/uiConstants'

import TextInput from 'components/TextInput'
import Loader from 'components/Loader'
import { BigNumber } from 'bignumber.js'
import DownArrow from 'images/down-arrow.png'
import Arrows from 'images/arrows.png'
import Info from 'images/info.png'

class BuySellAmounts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      toCC: true,
      advanced: false,
      cln: this.props.cln || '',
      cc: this.props.cc || '',
      priceChange: this.props.priceChange || (this.props.isBuy === true ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE * (-1)) // in percent
    }
  }

  componentWillMount () {
    const currentPrice = this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)

    this.setState({
      priceLimit: this.props.priceLimit || currentPrice.multipliedBy(1 + this.state.priceChange / 100).toString(),
      minimum: this.props.minimum || '',
      price: currentPrice.toFixed(5)
    })
  }

  next = () => {
    const { cln, cc, minimum, priceLimit, priceChange } = this.state
    const { isBuy, community, marketMakerActions, uiActions } = this.props

    if (isBuy) {
      marketMakerActions.estimateGasBuyCc(community.address, new BigNumber(cln).multipliedBy(1e18), minimum && new BigNumber(minimum.toString()).multipliedBy(1e18))
    } else {
      marketMakerActions.estimateGasSellCc(community.address, new BigNumber(cc).multipliedBy(1e18), minimum && new BigNumber(minimum.toString()).multipliedBy(1e18))
    }

    uiActions.setBuySellAmounts({
      buyStage: 2,
      ccAddress: community.address,
      cln: cln.toString(),
      cc: cc.toString(),
      isBuy,
      minimum,
      priceLimit,
      priceChange
    })
  }

  handleCLNInput = (event) => {
    const { isBuy, community, marketMakerActions, clnBalance } = this.props
    const cln = new BigNumber(event.target.value).multipliedBy(1e18)

    this.setState({
      cln: event.target.value,
      cc: '',
      toCC: true,
      maxAmountError: cln.isGreaterThan(clnBalance) ? 'Insufficient Funds' : undefined
    })
    if (isBuy) {
      marketMakerActions.buyQuote(community.address, cln)
    } else {
      marketMakerActions.invertSellQuote(community.address, cln)
    }
  }

  handleCCInput = (event) => {
    const { isBuy, community, marketMakerActions } = this.props
    const cc = new BigNumber(event.target.value).multipliedBy(1e18)

    this.setState({
      cc: event.target.value,
      cln: '',
      toCC: false
    })

    if (isBuy) {
      marketMakerActions.invertBuyQuote(community.address, cc)
    } else {
      marketMakerActions.sellQuote(community.address, cc)
    }
  }

  price = () => {
    return new BigNumber(this.props.quotePair.price ? this.props.quotePair.price.toString()
      : this.props.community.currentPrice.toString())
  }

  cln = () => {
    return this.props.isBuy ? (this.state.toCC ? this.state.cln : this.props.quotePair.inAmount) : this.props.quotePair.outAmount
  }

  componentWillReceiveProps = (nextProps, nextState) => {
    if (isEqual(nextProps.quotePair, this.props.quotePair)) {
      return
    }

    if (nextProps.quotePair.isFetching) {
      return
    }

    const { isBuy, clnBalance, ccBalance } = this.props
    const { toCC, priceChange } = this.state
    const priceLimit = this.price().multipliedBy(1 + priceChange / 100)
    const slippage = new BigNumber(nextProps.quotePair.slippage).multipliedBy(100).toFixed(5)

    if (isBuy && toCC) {
      this.setState({
        cc: new BigNumber(nextProps.quotePair.outAmount).div(1e18).toFixed(5, 1), // round down
        price: this.price(),
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) / priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
      })
    } else if (isBuy && !toCC) {
      this.setState({
        cln: new BigNumber(nextProps.quotePair.inAmount).div(1e18).toFixed(5), // round up
        price: this.price(),
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) / priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
      })
    } else if (!isBuy && toCC) {
      this.setState({
        cc: new BigNumber(nextProps.quotePair.inAmount).div(1e18).toFixed(5), // round up
        price: this.price(),
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) * priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
      })
    } else if (!isBuy && !toCC) {
      this.setState({
        cln: new BigNumber(nextProps.quotePair.outAmount).div(1e18).toFixed(5, 1), // round down
        price: this.price(),
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) * priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
      })
    }
  }

  handleChangeToSellTab = () => {
    if (this.props.isBuy) {
      this.handleChangeTab()
    }
  }

  handleChangeToBuyTab = () => {
    if (!this.props.isBuy) {
      this.handleChangeTab()
    }
  }

  handleChangeTab = () => {
    const currentPrice = this.props.community && this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)
    const priceChange = this.props.isBuy ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE * (-1)
    this.props.uiActions.setBuySellAmounts({
      cc: '',
      cln: '',
      isBuy: !this.props.isBuy,
      loading: false,
      maxAmountError: '',
      minimum: '',
      priceChange: priceChange,
      priceLimit: currentPrice.multipliedBy(1 + priceChange / 100).toString(),
      price: currentPrice.toFixed(5),
      slippage: ''
    })
  }

  handleAdvanced = () => {
    this.setState({ advanced: !this.state.advanced })
  }

  handleMinimum = (event) => {
    const { cln, cc } = this.state
    const { isBuy, community, quotePair } = this.props
    const minimum = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    let priceChange, priceLimit
    if (isBuy) {
      priceChange = cln ? (100 * (cln / minimum - price)) / price : ''
      priceLimit = cln ? cln / minimum : ''
    } else {
      priceChange = cc ? (100 * (minimum / cc - price)) / price : ''
      priceLimit = cc ? minimum / cc : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit
    })
  }

  handlePriceChange = (event) => {
    const { cln, cc } = this.state
    const { isBuy, community, quotePair } = this.props
    const priceChange = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    const priceLimit = quotePair.price ? price * (1 + priceChange / 100) : price.multipliedBy(1 + priceChange / 100)
    let minimum
    if (isBuy) {
      minimum = cln ? cln / priceLimit : ''
    } else {
      minimum = cc ? cc * priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit: priceLimit.toString()
    })
  }

  handlePriceLimit = (event) => {
    const { cln, cc } = this.state
    const { isBuy, community, quotePair } = this.props
    const priceLimit = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    let minimum
    if (isBuy) {
      minimum = cln ? cln / priceLimit : ''
    } else {
      minimum = cc ? cc * priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange: (100 * (priceLimit - price)) / price,
      priceLimit
    })
  }
  handleClickMax = () => {
    const { isBuy, community, marketMakerActions } = this.props
    const { cln, cc } = this.state
    const clnBalance = new BigNumber(this.props.clnBalance)
    const ccBalance = new BigNumber(this.props.ccBalance)

    if (isBuy && cln.toString() !== clnBalance.div(1e18).toString()) {
      this.setState({
        cln: clnBalance.div(1e18),
        cc: '',
        toCC: true
      })
      marketMakerActions.buyQuote(community.address, clnBalance)
    } else if (!isBuy && cc.toString() !== ccBalance.div(1e18).toString()) {
      this.setState({
        cc: ccBalance.div(1e18),
        cln: '',
        toCC: false
      })
      marketMakerActions.sellQuote(community.address, ccBalance)
    }
  }

  renderClnInput = (className, error) => {
    const {isFetching} = this.props
    const {toCC, cln} = this.state

    return (
      <Fragment>
        <TextInput id='in-amount'
          className={className}
          placeholder={(isFetching && !toCC) ? '' : `Enter amount in CLN`}
          error={error}
          value={cln}
          onChange={this.handleCLNInput}
        />
        {(isFetching && !toCC) ? <Loader className='loader input' /> : null}
        <div className='input-coin-symbol'>CLN</div>
      </Fragment>
    )
  }

  renderCcInput = (className, error) => {
    const {isFetching} = this.props
    const {toCC, cc} = this.state
    const ccSymbol = this.props.community.symbol

    return (
      <Fragment>
        <TextInput
          className={className}
          placeholder={(isFetching && toCC) ? '' : `Enter amount in ${ccSymbol}`}
          error={error}
          value={cc}
          onChange={this.handleCCInput}
        />
        {(isFetching && toCC) ? <Loader className='loader input' /> : null}
        <div className='input-coin-symbol'>{ccSymbol}</div>
      </Fragment>
    )
  }

  render () {
    const { isBuy, community, isFetching } = this.props
    const { advanced, maxAmountError, cln, cc, price, slippage, minimum, priceChange, priceLimit } = this.state
    const ccSymbol = community.symbol
    const ccPrice = community.currentPrice
    const ccBalance = new BigNumber(this.props.ccBalance).div(1e18).toFormat(5, 1)
    const clnBalance = new BigNumber(this.props.clnBalance).div(1e18).toFormat(5, 1)

    const buyTabClass = classNames({
      'buy-tab': true,
      'active': isBuy
    })
    const sellTabClass = classNames({
      'buy-tab': true,
      'active': !isBuy
    })
    const advancedClass = classNames({
      'advanced-settings': true,
      'open': advanced
    })
    const maxAmountClass = classNames({
      'max-amount': true,
      'error': maxAmountError
    })
    const buySellInputClass = classNames({
      'buy-sell-input': true,
      'error': maxAmountError
    })

    return (
      <div>
        <div className='buy-sell-top'>
          <div className='buy-sell-tab'>
            <div className={buyTabClass} onClick={this.handleChangeToBuyTab}>BUY</div>
            <div className={sellTabClass} onClick={this.handleChangeToSellTab}>SELL</div>
          </div>
          {
            isBuy ? this.renderClnInput(buySellInputClass, maxAmountError) : this.renderCcInput(buySellInputClass, maxAmountError)
          }
          <div className={maxAmountClass} onClick={this.handleClickMax}>{`Max: ${isBuy ? clnBalance + ' CLN' : ccBalance + ' ' + ccSymbol}`}</div>
        </div>
        <div className='arrows'><img src={Arrows} /></div>
        <div className='buy-sell-bottom'>
          <div className='info-price'>
            <div className='cc-to-cln'>{`1 ${ccSymbol} = ${price} CLN`}</div>
            {slippage ? <div>PRICE SLIPPAGE<img src={Info} />{`${slippage}%`}</div> : null}
          </div>
          {
            isBuy ? this.renderCcInput('buy-sell-input') : this.renderClnInput('buy-sell-input')
          }
          <div className={advancedClass}>
            <div className='advanced-header'>
              <h5 onClick={this.handleAdvanced}>Advanced settings</h5>
              <img onClick={this.handleAdvanced} src={DownArrow} />
            </div>
            <TextInput id='minimum'
              type='number'
              label='MINIMAL ACCEPTABLE AMOUNT'
              placeholder={`Enter minimal amount of ${isBuy ? ccSymbol : 'CLN'}`}
              onChange={this.handleMinimum}
              value={minimum}
            />
            <div className='minimum-coin-symbol'>{isBuy ? ccSymbol : 'CLN'}</div>
            <TextInput id='price-change'
              type='number'
              label={`${ccSymbol} PRICE CHANGE`}
              placeholder='Enter price change in %'
              value={priceChange}
              onChange={this.handlePriceChange}
            />
            <div className='price-change-percent'>%</div>
            <TextInput id='price-limit'
              type='number'
              label={`${ccSymbol} PRICE LIMIT`}
              placeholder={`Enter price limit for ${ccSymbol}`}
              value={priceLimit}
              onChange={this.handlePriceLimit}
            />
            <div className='price-limit-cln'>CLN</div>
            <p className='annotation'>{`The transaction will fail if the price of 1 ${ccSymbol} is ${(isBuy ? 'higher' : 'lower')} than ${(priceLimit || ccPrice)} CLN`}</p>
          </div>
          <button disabled={maxAmountError || !cln || cln === 0 || cc === 0 || isFetching} onClick={this.next}>{isBuy ? `Buy ${ccSymbol}` : `Sell ${ccSymbol}`}</button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  marketMakerActions: bindActionCreators(marketMakerActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  quotePair: state.marketMaker.quotePair || {},
  isFetching: state.marketMaker.quotePair && state.marketMaker.quotePair.isFetching,
  ...props
})

export default connect(mapStateToProps, mapDispatchToProps)(BuySellAmounts)
