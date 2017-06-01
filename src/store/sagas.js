import { mapValues, pickBy } from 'lodash'
import { all, put, select, takeEvery } from 'redux-saga/effects'
import Vector from 'victor'
import makeAction from './helpers/makeAction'
import {
  SET_BALL_POSITION,
  SET_BALL_VELOCITY,
  SET_PADDLE1_POSITION,
  SET_PADDLE2_POSITION,
  SET_WINDOW_SIZE,
  REQUEST_UPDATE_GAME_STATE,
  REQUEST_COLLISION_CHECK
} from './types'

function * updateGameState ({ payload: timeInterval }) {
  const state = yield select()

  if (state.gamePaused) return

  const vectors = pickBy(state, (vector) => vector.hasOwnProperty('x') && vector.hasOwnProperty('y'))

  const {
    ballPosition,
    ballVelocity,
    paddle1Position,
    paddle1Velocity,
    paddle2Position,
    paddle2Velocity
  } = mapValues(vectors, Vector.fromObject)

  const timeMultiplier = timeInterval * 60 / 1000

  const ballPositionNext = ballPosition.add(ballVelocity.multiplyScalar(timeMultiplier))
  const paddle1PositionNext = paddle1Position.add(paddle1Velocity.multiplyScalar(timeMultiplier))
  const paddle2PositionNext = paddle2Position.add(paddle2Velocity.multiplyScalar(timeMultiplier))

  yield all([
    put(makeAction(SET_BALL_POSITION, ballPositionNext.toObject())),
    put(makeAction(SET_PADDLE1_POSITION, paddle1PositionNext.toObject())),
    put(makeAction(SET_PADDLE2_POSITION, paddle2PositionNext.toObject()))
  ])

  yield put(makeAction(REQUEST_COLLISION_CHECK))
}

function * watchrequestUpdateGameState () {
  yield takeEvery(REQUEST_UPDATE_GAME_STATE, updateGameState)
}

const getRectBounds = ({ x, y, width, height }) => {
  const left = x - width / 2
  const right = x + width / 2
  const top = y + height / 2
  const bottom = y - height / 2
  return { left, right, top, bottom }
}

const checkCollision = (rect1, rect2) => {
  const rect1Bounds = getRectBounds(rect1)
  const rect2Bounds = getRectBounds(rect2)

  const leftOverlapsRight = rect1Bounds.left < rect2Bounds.right
  const rightOverlapsLeft = rect1Bounds.right > rect2Bounds.left
  const bottomOverlapsTop = rect1Bounds.bottom < rect2Bounds.top
  const topOverlapsBottom = rect1Bounds.top > rect2Bounds.bottom

  return leftOverlapsRight && rightOverlapsLeft && bottomOverlapsTop && topOverlapsBottom
}

const makeRect = ({ x, y }, { x: width, y: height }) => ({ x, y, width, height })

function * collisionCheck () {
  const {
    ballPosition,
    ballRadius,
    ballVelocity,
    paddle1Position,
    paddle1Dimensions,
    paddle2Position,
    paddle2Dimensions
  } = yield select()

  const ball = makeRect(ballPosition, { x: ballRadius * 2, y: ballRadius * 2 })
  const paddle1 = makeRect(paddle1Position, paddle1Dimensions)
  const paddle2 = makeRect(paddle2Position, paddle2Dimensions)

  if (checkCollision(ball, paddle1)) {
    const newVelocity = { x: (ball.x - paddle1.x) / paddle1Dimensions.x, y: -Math.abs(ballVelocity.y) }
    yield put(makeAction(SET_BALL_VELOCITY, Vector.fromObject(newVelocity).normalize().toObject()))
  }

  if (checkCollision(ball, paddle2)) {
    const newVelocity = { x: (ball.x - paddle2.x) / paddle2Dimensions.x, y: Math.abs(ballVelocity.y) }
    yield put(makeAction(SET_BALL_VELOCITY, Vector.fromObject(newVelocity).normalize().toObject()))
  }
}

function * watchRequestCollisionCheck () {
  yield takeEvery(REQUEST_COLLISION_CHECK, collisionCheck)
}

function * setPaddleDistance ({ payload: { width, height } }) {
  const {
    paddle1Position,
    paddle2Position
  } = yield select()

  yield all([
    put(makeAction(SET_PADDLE1_POSITION, { x: paddle1Position.x, y: height / 3 })),
    put(makeAction(SET_PADDLE2_POSITION, { x: paddle2Position.x, y: -height / 3 }))
  ])
}

function * watchWindowResize () {
  yield takeEvery(SET_WINDOW_SIZE, setPaddleDistance)
}

export default function * sagas () {
  yield all([
    watchrequestUpdateGameState(),
    watchRequestCollisionCheck(),
    watchWindowResize()
  ])
}
