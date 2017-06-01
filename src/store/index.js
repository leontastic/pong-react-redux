import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import sagas from './sagas'
import reducers from './reducers'
import initialState from './initialState'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const sagaMiddleware = createSagaMiddleware()
const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware))

const store = createStore(reducers, initialState, enhancer)

sagaMiddleware.run(sagas)

export default store
