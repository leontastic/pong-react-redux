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

const reducers = {
  ballPosition: makeSetterReducer(SET_BALL_POSITION),
  ballVelocity: makeSetterReducer(SET_BALL_VELOCITY),
  paddle1Position: makeSetterReducer(SET_PADDLE_1_POSITION),
  paddle1Velocity: makeSetterReducer(SET_PADDLE_1_VELOCITY),
  paddle2Position: makeSetterReducer(SET_PADDLE_2_POSITION),
  paddle2Velocity: makeSetterReducer(SET_PADDLE_2_VELOCITY),
  gamePaused: makeSetterReducer(SET_GAME_PAUSED),
  gameScore: makeSetterReducer(SET_GAME_SCORE)
}

const rootReducer = combineReducers(reducers)

export default rootReducer
