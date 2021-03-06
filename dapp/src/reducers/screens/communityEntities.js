import {
  ADD_ENTITY,
  EDIT_ENTITY,
  FETCH_USERS_ENTITIES,
  FETCH_BUSINESSES_ENTITIES,
  REMOVE_ENTITY,
  ADD_ADMIN_ROLE,
  REMOVE_ADMIN_ROLE,
  TOGGLE_COMMUNITY_MODE
} from 'actions/communityEntities'
import { REQUEST } from 'actions/constants'
import { LOCATION_CHANGE } from 'connected-react-router'
import omit from 'lodash/omit'

const initialState = {
  usersResults: [],
  merchantsResults: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_COMMUNITY_MODE.REQUEST:
      return { ...omit(state, ['toggleSuccess']) }
    case TOGGLE_COMMUNITY_MODE.SUCCESS:
      return { ...state, toggleSuccess: true }
    case ADD_ADMIN_ROLE.REQUEST:
      return { ...state, transactionStatus: REQUEST, signatureNeeded: true }
    case ADD_ADMIN_ROLE.PENDING:
      return { ...state, transactionHash: action.response.transactionHash, signatureNeeded: false }
    case ADD_ADMIN_ROLE.SUCCESS:
      return { ...state, ...action.response }
    case REMOVE_ADMIN_ROLE.REQUEST:
      return { ...state, transactionStatus: REQUEST }
    case REMOVE_ADMIN_ROLE.PENDING:
      return { ...state, transactionHash: action.response.transactionHash, signatureNeeded: false }
    case REMOVE_ADMIN_ROLE.SUCCESS:
      return { ...state, ...action.response }
    case REMOVE_ENTITY.REQUEST:
      return { ...state, transactionStatus: REQUEST }
    case REMOVE_ENTITY.PENDING:
      return { ...state, transactionHash: action.response.transactionHash, signatureNeeded: false }
    case REMOVE_ENTITY.SUCCESS:
      const { receipt: { events: { EntityRemoved: { returnValues: { account } } } } } = action.response
      return {
        ...state,
        ...action.response,
        merchantsResults: state.merchantsResults.filter(val => val !== account),
        usersResults: state.usersResults.filter(val => val !== account)
      }
    case ADD_ENTITY.REQUEST:
      return { ...state, signatureNeeded: true }
    case ADD_ENTITY.FAILURE:
      return { ...omit(state, ['transactionHash']), signatureNeeded: false }
    case ADD_ENTITY.PENDING:
      return { ...state, transactionHash: action.response.transactionHash, signatureNeeded: false }
    case ADD_ENTITY.SUCCESS:
      return { ...state, fetchEntities: true }
    case EDIT_ENTITY.PENDING:
      return { ...state, editTransactionHash: action.response.transactionHash }
    case FETCH_USERS_ENTITIES.SUCCESS:
      return { ...state, usersResults: [...action.response.result], fetchEntities: false }
    case FETCH_BUSINESSES_ENTITIES.SUCCESS:
      return { ...state, merchantsResults: [...action.response.result], fetchEntities: false }
    case LOCATION_CHANGE:
      if (action.payload.location.pathname === '/') {
        return initialState
      } else {
        return state
      }
    default:
      return state
  }
}
