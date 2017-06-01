import { createStore } from 'redux'
import reducers from './reducers'

const initialState = {
  ballPosition: { x: 0, y: 0 },
  ballVelocity: { x: 0, y: 0 },
  paddle1Position: { x: 0, y: 100 },
  paddle1Velocity: { x: 0, y: 0 },
  paddle2Position: { x: 0, y: -100 },
  paddle2Velocity: { x: 0, y: 0 },
  gamePaused: true,
  gameScore: 0
}

const middleware = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

const store = createStore(reducers, initialState, middleware)

export default store
