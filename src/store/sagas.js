import { mapValues } from 'lodash'
import { all, put, select, takeEvery } from 'redux-saga/effects'
import Vector from 'victor'
import makeAction from './helpers/makeAction'
import {
  SET_BALL_POSITION,
  SET_PADDLE_1_POSITION,
  SET_PADDLE_2_POSITION,
  ANIMATE_GAME_STATE
} from './types'

function * nextGameState ({ payload: timeInterval }) {
  const timeMultiplier = timeInterval * 60 / 1000
  const state = yield select()

  const {
    gamePaused,
    gameScore,
    ...gameVectors
  } = state

  const {
    ballPosition,
    ballVelocity,
    paddle1Position,
    paddle1Velocity,
    paddle2Position,
    paddle2Velocity
  } = mapValues(gameVectors, Vector.fromObject)

  const ballPositionNext = ballPosition.add(ballVelocity.multiplyScalar(timeMultiplier))
  const paddle1PositionNext = paddle1Position.add(paddle1Velocity.multiplyScalar(timeMultiplier))
  const paddle2PositionNext = paddle2Position.add(paddle2Velocity.multiplyScalar(timeMultiplier))

  yield all([
    put(makeAction(SET_BALL_POSITION, ballPositionNext.toObject())),
    put(makeAction(SET_PADDLE_1_POSITION, paddle1PositionNext.toObject())),
    put(makeAction(SET_PADDLE_2_POSITION, paddle2PositionNext.toObject()))
  ])
}

function * watchNextState () {
  yield takeEvery(ANIMATE_GAME_STATE, nextGameState)
}

export default function * sagas () {
  yield all([
    watchNextState()
  ])
}
