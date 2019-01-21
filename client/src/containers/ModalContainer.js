import React from 'react'
import { connect } from 'react-redux'

import {hideModal} from 'actions/ui'
import LoginModal from 'components/LoginModal'
import WrongNetworkModal from 'components/WrongNetworkModal'
import LoadingModal from 'components/LoadingModal'
import ExchangeModal from 'components/exchange/ExchangeModal'
import ErrorBoundary from 'components/ErrorBoundary'
import UserDatatModal from 'components/issuance/UserDatatModal'
import SimpleExchangeModal from 'components/oven/SimpleExchangeModal'
import EconomicCalculatorModal from 'components/EconomicCalculatorModal'

import {
  LOGIN_MODAL,
  WRONG_NETWORK_MODAL,
  EXCHANGE_MODAL,
  LOADING_MODAL,
  USER_DATA_MODAL,
  SIMPLE_EXCHANGE_MODAL,
  ECONOMIC_CALCULATOR_MODAL,
} from 'constants/uiConstants'

const renderModal = (modalComponent, props) =>
  <ErrorBoundary hideModal={props.hideModal}>
    {React.createElement(modalComponent, props)}
  </ErrorBoundary>

const MODAL_COMPONENTS = {
  [LOGIN_MODAL]: LoginModal,
  [EXCHANGE_MODAL]: ExchangeModal,
  [WRONG_NETWORK_MODAL]: WrongNetworkModal,
  [LOADING_MODAL]: LoadingModal,
  [USER_DATA_MODAL]: UserDatatModal,
  [SIMPLE_EXCHANGE_MODAL]: SimpleExchangeModal,
  [ECONOMIC_CALCULATOR_MODAL]: EconomicCalculatorModal
}

const ModalContainer = (props) => {
  if (!props.modalType) {
    return null
  }

  const ModalType = MODAL_COMPONENTS[props.modalType]
  return renderModal(ModalType, {...props.modalProps, hideModal: props.hideModal})
}

const mapStateToProps = state => {
  return {
    modalType: state.ui.modalType,
    modalProps: state.ui.modalProps
  }
}

const mapDispatchToProps = {
  hideModal
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalContainer)
