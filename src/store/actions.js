import makeAction from './helpers/makeAction'
import {
  SET_PADDLE1_VELOCITY,
  SET_PADDLE2_VELOCITY,
  SET_GAME_PAUSED,
  SET_WINDOW_SIZE,
  REQUEST_UPDATE_GAME_STATE
} from './types'

export const setGamePaused = (pause) => makeAction(SET_GAME_PAUSED, pause)
export const setWindowSize = (size) => makeAction(SET_WINDOW_SIZE, size)
export const setPaddle1Velocity = (velocity) => makeAction(SET_PADDLE1_VELOCITY, velocity)
export const setPaddle2Velocity = (velocity) => makeAction(SET_PADDLE2_VELOCITY, velocity)
export const requestUpdateGameState = (timeInterval = 1) => makeAction(REQUEST_UPDATE_GAME_STATE, timeInterval)
