import makeAction from './helpers/makeAction'
import { SET_GAME_PAUSED, ANIMATE_GAME_STATE } from './types'

export const setGamePaused = (pause) => makeAction(SET_GAME_PAUSED, pause)
export const animateGameState = (timeInterval = 1) => makeAction(ANIMATE_GAME_STATE, timeInterval)
