import { mapValues } from 'lodash'
import { combineReducers } from 'redux'
import initialState from './initialState'
import makeSetterReducer from './helpers/makeSetterReducer'
import {
  SET_BALL_POSITION,
  SET_BALL_VELOCITY,
  SET_BALL_RADIUS,
  SET_PADDLE1_POSITION,
  SET_PADDLE1_VELOCITY,
  SET_PADDLE1_DIMENSIONS,
  SET_PADDLE2_POSITION,
  SET_PADDLE2_VELOCITY,
  SET_PADDLE2_DIMENSIONS,
  SET_GAME_PAUSED,
  SET_GAME_SCORE,
  SET_WINDOW_SIZE
} from './types'

const reducers = mapValues({
  ballPosition: SET_BALL_POSITION,
  ballVelocity: SET_BALL_VELOCITY,
  ballRadius: SET_BALL_RADIUS,
  paddle1Position: SET_PADDLE1_POSITION,
  paddle1Velocity: SET_PADDLE1_VELOCITY,
  paddle1Dimensions: SET_PADDLE1_DIMENSIONS,
  paddle2Position: SET_PADDLE2_POSITION,
  paddle2Velocity: SET_PADDLE2_VELOCITY,
  paddle2Dimensions: SET_PADDLE2_DIMENSIONS,
  gamePaused: SET_GAME_PAUSED,
  gameScore: SET_GAME_SCORE,
  windowSize: SET_WINDOW_SIZE
}, (type, key) => makeSetterReducer(type, initialState[key]))

const rootReducer = combineReducers(reducers)

export default rootReducer
