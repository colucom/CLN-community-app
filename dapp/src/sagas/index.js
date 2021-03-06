import { all, fork } from 'redux-saga/effects'

import networkSaga from './network'
import metadataSaga from './metadata'
import accountsSaga from './accounts'
import commuityEntitiesSaga from './commuityEntities'
import tokenSaga from './token'
import userSaga from './user'
import bridgeSaga from './bridge'

export default function * rootSaga () {
  yield all([
    fork(metadataSaga),
    fork(networkSaga),
    fork(accountsSaga),
    fork(commuityEntitiesSaga),
    fork(tokenSaga),
    fork(userSaga),
    fork(bridgeSaga)
  ])
}
