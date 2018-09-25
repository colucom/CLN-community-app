import * as ui from 'actions/ui'
import {quoteActions, CHANGE} from 'actions/marketMaker'
import {filterSuccessActions, filterRequestActions} from 'utils/actions'

const relevantQuoteActions = {...filterRequestActions(quoteActions),
  ...filterSuccessActions(quoteActions)}
relevantQuoteActions[CHANGE.PENDING] = CHANGE

export default (state = {
  activeMarker: null,
  modalType: null,
  signupHide: false,
  scrollPosition: 0,
  elementsPosition: {
    elementName: null,
    stickIt: false,
    position: 0
  }
}, action) => {
  if (relevantQuoteActions.hasOwnProperty(action.type)) {
    return {...state, modalProps: {...state.modalProps, ...action.response}}
  }
  switch (action.type) {
    case ui.ACTIVE_MARKER:
      return {...state, activeMarker: action.coinAddress}
    case ui.ZOOM:
      return {...state, zoom: action.zoom}
    case ui.SHOW_MODAL:
      return {...state, modalType: action.modalType, modalProps: action.modalProps}
    case ui.HIDE_MODAL:
      return {...state, modalType: null, modalProps: null}
    case ui.SET_MODAL_PROPS:
      return {...state, modalProps: action.modalProps}
    case ui.UPDATE_MODAL_PROPS:
      return {...state, modalProps: {...state.modalProps, ...action.modalProps}}
    case ui.SIGNUP_HIDE:
      return {...state, signupHide: action.hide}
    case ui.SIGNUP_CLOSE:
      return {...state, signupClose: action.close}
    case ui.SET_SCROLL_POSITION:
      return {...state, scrollPosition: action.scrollPosition}
    case ui.SET_ELEMENT_POSITION:
      return {...state, elementsPosition: {...action.elementsPosition}}
    default:
      return state
  }
}
