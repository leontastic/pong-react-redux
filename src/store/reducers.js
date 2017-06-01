import { mapValues } from 'lodash'
import { combineReducers } from 'redux'
import makeSetterReducer from './helpers/makeSetterReducer'
import {
  SET_BALL_POSITION,
  SET_BALL_VELOCITY,
  SET_PADDLE_1_POSITION,
  SET_PADDLE_1_VELOCITY,
  SET_PADDLE_2_POSITION,
  SET_PADDLE_2_VELOCITY,
  SET_GAME_PAUSED,
  SET_GAME_SCORE
} from './types'

const reducers = mapValues({
  ballPosition: SET_BALL_POSITION,
  ballVelocity: SET_BALL_VELOCITY,
  paddle1Position: SET_PADDLE_1_POSITION,
  paddle1Velocity: SET_PADDLE_1_VELOCITY,
  paddle2Position: SET_PADDLE_2_POSITION,
  paddle2Velocity: SET_PADDLE_2_VELOCITY,
  gamePaused: SET_GAME_PAUSED,
  gameScore: SET_GAME_SCORE
}, makeSetterReducer)

const rootReducer = combineReducers(reducers)

export default rootReducer
