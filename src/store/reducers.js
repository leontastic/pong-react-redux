import { mapValues } from 'lodash'
import { combineReducers } from 'redux'
import initialState from './initialState'
import makeIncrementReducer from './helpers/makeIncrementReducer'
import makeSetterReducer from './helpers/makeSetterReducer'
import {
  INCREMENT_PADDLE1_SCORE,
  INCREMENT_PADDLE2_SCORE,
  SET_BALL_POSITION,
  SET_BALL_RADIUS,
  SET_BALL_VELOCITY,
  SET_GAME_PAUSED,
  SET_GAME_SPEED,
  SET_PADDLE1_DIMENSIONS,
  SET_PADDLE1_POSITION,
  SET_PADDLE1_VELOCITY,
  SET_PADDLE2_DIMENSIONS,
  SET_PADDLE2_POSITION,
  SET_PADDLE2_VELOCITY,
  SET_WINDOW_SIZE
} from './types'

const incrementers = mapValues({
  paddle1Score: INCREMENT_PADDLE1_SCORE,
  paddle2Score: INCREMENT_PADDLE2_SCORE
}, (type, key) => makeIncrementReducer(type, initialState[key]))

const setters = mapValues({
  ballPosition: SET_BALL_POSITION,
  ballRadius: SET_BALL_RADIUS,
  ballVelocity: SET_BALL_VELOCITY,
  gamePaused: SET_GAME_PAUSED,
  gameSpeed: SET_GAME_SPEED,
  paddle1Dimensions: SET_PADDLE1_DIMENSIONS,
  paddle1Position: SET_PADDLE1_POSITION,
  paddle1Velocity: SET_PADDLE1_VELOCITY,
  paddle2Dimensions: SET_PADDLE2_DIMENSIONS,
  paddle2Position: SET_PADDLE2_POSITION,
  paddle2Velocity: SET_PADDLE2_VELOCITY,
  windowSize: SET_WINDOW_SIZE
}, (type, key) => makeSetterReducer(type, initialState[key]))

const rootReducer = combineReducers({ ...incrementers, ...setters })

export default rootReducer
