import { mapValues, pickBy } from 'lodash'
import { all, put, select, takeEvery } from 'redux-saga/effects'
import Vector from 'victor'
import makeAction from './helpers/makeAction'
import initialState from './initialState'
import {
  INCREMENT_PADDLE1_SCORE,
  INCREMENT_PADDLE2_SCORE,
  REQUEST_COLLISION_CHECK,
  REQUEST_UPDATE_GAME_STATE,
  RESET_GAME,
  SET_BALL_POSITION,
  SET_BALL_VELOCITY,
  SET_GAME_PAUSED,
  SET_PADDLE1_POSITION,
  SET_PADDLE1_VELOCITY,
  SET_PADDLE2_POSITION,
  SET_PADDLE2_VELOCITY,
  SET_WINDOW_SIZE
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

  const timeMultiplier = timeInterval * 60 / 1000 * state.gameSpeed

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
  const top = y - height / 2
  const bottom = y + height / 2
  return { left, right, top, bottom }
}

const collisionRects = (rect1, rect2) => {
  const rect1Bounds = getRectBounds(rect1)
  const rect2Bounds = getRectBounds(rect2)

  const leftOverlapsRight = rect1Bounds.left < rect2Bounds.right
  const rightOverlapsLeft = rect1Bounds.right > rect2Bounds.left
  const bottomOverlapsTop = rect1Bounds.bottom > rect2Bounds.top
  const topOverlapsBottom = rect1Bounds.top < rect2Bounds.bottom

  return leftOverlapsRight && rightOverlapsLeft && bottomOverlapsTop && topOverlapsBottom
}

const collisionLeft = (rect, windowWidth) => {
  const rectBounds = getRectBounds(rect)
  return rectBounds.left < -windowWidth / 2
}

const collisionRight = (rect, windowWidth) => {
  const rectBounds = getRectBounds(rect)
  return rectBounds.right > windowWidth / 2
}

const collisionTop = (rect, windowHeight) => {
  const rectBounds = getRectBounds(rect)
  return rectBounds.top < -windowHeight / 2
}

const collisionBottom = (rect, windowHeight) => {
  const rectBounds = getRectBounds(rect)
  return rectBounds.bottom > windowHeight / 2
}

const makeRect = ({ x, y }, { x: width, y: height }) => ({ x, y, width, height })

function * collisionCheck () {
  const {
    ballPosition,
    ballRadius,
    ballVelocity,
    paddle1Position,
    paddle1Dimensions,
    paddle1Velocity,
    paddle2Position,
    paddle2Dimensions,
    paddle2Velocity,
    windowSize
  } = yield select()

  const ball = makeRect(ballPosition, { x: ballRadius * 2, y: ballRadius * 2 })
  const paddle1 = makeRect(paddle1Position, paddle1Dimensions)
  const paddle2 = makeRect(paddle2Position, paddle2Dimensions)

  if (collisionRects(ball, paddle1)) {
    const newVelocity = { x: (ball.x - paddle1.x) / paddle1Dimensions.x, y: -Math.abs(ballVelocity.y) }
    yield put(makeAction(SET_BALL_VELOCITY, Vector.fromObject(newVelocity).normalize().toObject()))
  }

  if (collisionRects(ball, paddle2)) {
    const newVelocity = { x: (ball.x - paddle2.x) / paddle2Dimensions.x, y: Math.abs(ballVelocity.y) }
    yield put(makeAction(SET_BALL_VELOCITY, Vector.fromObject(newVelocity).normalize().toObject()))
  }

  if (collisionLeft(ball, windowSize.width)) {
    const newVelocity = { x: Math.abs(ballVelocity.x), y: ballVelocity.y }
    yield put(makeAction(SET_BALL_VELOCITY, Vector.fromObject(newVelocity).normalize().toObject()))
  }

  if (collisionRight(ball, windowSize.width)) {
    const newVelocity = { x: -Math.abs(ballVelocity.x), y: ballVelocity.y }
    yield put(makeAction(SET_BALL_VELOCITY, Vector.fromObject(newVelocity).normalize().toObject()))
  }

  if (collisionLeft(paddle1, windowSize.width)) {
    yield all([
      put(makeAction(SET_PADDLE1_VELOCITY, { x: Math.max(paddle1Velocity.x, 0), y: 0 })),
      put(makeAction(SET_PADDLE1_POSITION, { x: -windowSize.width / 2 + paddle1.width / 2, y: paddle1.y }))
    ])
  }

  if (collisionRight(paddle1, windowSize.width)) {
    yield all([
      put(makeAction(SET_PADDLE1_VELOCITY, { x: Math.min(paddle1, 0), y: 0 })),
      put(makeAction(SET_PADDLE1_POSITION, { x: windowSize.width / 2 - paddle1.width / 2, y: paddle1.y }))
    ])
  }

  if (collisionLeft(paddle2, windowSize.width)) {
    yield all([
      put(makeAction(SET_PADDLE2_VELOCITY, { x: Math.max(paddle2Velocity.x, 0), y: 0 })),
      put(makeAction(SET_PADDLE2_POSITION, { x: -windowSize.width / 2 + paddle2.width / 2, y: paddle2.y }))
    ])
  }

  if (collisionRight(paddle2, windowSize.width)) {
    yield all([
      put(makeAction(SET_PADDLE2_VELOCITY, { x: Math.min(paddle2, 0), y: 0 })),
      put(makeAction(SET_PADDLE2_POSITION, { x: windowSize.width / 2 - paddle2.width / 2, y: paddle2.y }))
    ])
  }

  if (collisionTop(ball, windowSize.height)) {
    yield put(makeAction(INCREMENT_PADDLE1_SCORE))
    yield put(makeAction(RESET_GAME))
  }

  if (collisionBottom(ball, windowSize.height)) {
    yield put(makeAction(INCREMENT_PADDLE2_SCORE))
    yield put(makeAction(RESET_GAME))
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

function * resetGame () {
  const {
    paddle1Position,
    paddle2Position
  } = yield select()

  yield all([
    put(makeAction(SET_BALL_POSITION, initialState.ballPosition)),
    put(makeAction(SET_BALL_VELOCITY, initialState.ballVelocity)),
    put(makeAction(SET_PADDLE1_POSITION, { x: initialState.paddle1Position.x, y: paddle1Position.y })),
    put(makeAction(SET_PADDLE1_VELOCITY, initialState.paddle1Velocity)),
    put(makeAction(SET_PADDLE2_POSITION, { x: initialState.paddle2Position.x, y: paddle2Position.y })),
    put(makeAction(SET_PADDLE2_VELOCITY, initialState.paddle2Velocity)),
    put(makeAction(SET_GAME_PAUSED, initialState.gamePaused))
  ])
}

function * watchResetGame () {
  yield takeEvery(RESET_GAME, resetGame)
}

export default function * sagas () {
  yield all([
    watchrequestUpdateGameState(),
    watchRequestCollisionCheck(),
    watchWindowResize(),
    watchResetGame()
  ])
}
