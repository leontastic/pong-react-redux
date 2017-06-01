import { range } from 'lodash'
import Radium from 'radium'
import React, { Component } from 'react'
import { Group, Layer, Circle, Rect, Stage } from 'react-konva'
import { connect } from 'react-redux'
import multidecorator from 'react-multidecorator'
import { DOM, Observable, Scheduler } from 'rx-dom'
import Vector from 'victor'

import {
  setGamePaused,
  setWindowSize,
  setPaddle1Velocity,
  setPaddle2Velocity,
  requestUpdateGameState
} from '../store/actions'
import makeDispatcher from '../store/helpers/makeDispatcher'

const normalizeOrigin = (position, dimensions, containerDimensions) => {
  position = Vector.fromObject(position)
  const offset = Vector.fromObject(dimensions).divideScalar(2)
  const origin = Vector.fromObject(containerDimensions).divideScalar(2)
  return position.subtract(offset).add(origin).toObject()
}

const Ball = ({ x, y, radius }) => <Circle x={x} y={y} radius={radius} fill='#a40000' />

const Paddle = ({ x, y, width, height }) => <Rect x={x} y={y} width={width} height={height} fill='silver' />

const Grid = ({ x, y, width, height }) => {
  const numColumns = Math.ceil(width / 10)
  const numRows = Math.ceil(height / 10)
  const dimensions = { x: width, y: height }

  const columns = range(numColumns)
    .map((colNumber) => (colNumber - numColumns / 2) * 10)
    .map((colPosition, index) => <Rect key={index} {...normalizeOrigin({ x: colPosition, y: 0 }, { x: 1, y: height }, dimensions)} width={1} height={height} fill='silver' opacity={0.5} />)

  const rows = range(numRows)
    .map((rowNumber) => (rowNumber - numRows / 2) * 10)
    .map((rowPosition, index) => <Rect key={index} {...normalizeOrigin({ x: 0, y: rowPosition }, { x: width, y: 1 }, dimensions)} width={width} height={1} fill='silver' opacity={0.5} />)

  return (
    <Group>
      {columns}
      {rows}
    </Group>
  )
}

class Pong extends Component {
  constructor () {
    super()

    this.handleResize = this.handleResize.bind(this)
    this.toggleGamePause = this.toggleGamePause.bind(this)
  }

  handleResize () {
    this.props.setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }

  toggleGamePause () {
    this.props.setGamePaused(!this.props.gamePaused)
  }

  componentDidMount () {
    const nextAnimationFrame = Observable.interval(0, Scheduler.requestAnimationFrame)
      .timeInterval()
      .pluck('interval')

    nextAnimationFrame.subscribe(this.props.requestUpdateGameState)
  }

  componentWillMount () {
    const { setPaddle1Velocity, setPaddle2Velocity, paddle1Velocity, paddle2Velocity } = this.props

    const keydown = DOM.keydown(document)
    const keyup = DOM.keyup(document)
    const holdingKey = (key) => Observable.merge(keydown, keyup)
      .filter(({ keyCode }) => keyCode === key)
      .do((event) => event.preventDefault())
      .map(({ type }) => type === 'keydown')
      .distinctUntilChanged()
      .startWith(false)

    // toggle game pause on spacebar
    holdingKey(32).filter((holding) => holding).subscribe(this.toggleGamePause)

    const computeDirection = (left, right) => (left ? -1 : 0) + (right ? 1 : 0)

    // manipulate paddle1 velocity with left and right arrow keys
    Observable.combineLatest(holdingKey(37), holdingKey(39))
      .map(([left, right]) => computeDirection(left, right))
      .subscribe((direction) => setPaddle1Velocity({ x: direction, y: paddle1Velocity.y }))

    // manipulate paddle2 velocity with z and x keys
    Observable.combineLatest(holdingKey(90), holdingKey(88))
      .map(([left, right]) => computeDirection(left, right))
      .subscribe((direction) => setPaddle2Velocity({ x: direction, y: paddle2Velocity.y }))

    DOM.resize(window)
      .throttle(1, Scheduler.requestAnimationFrame)
      .startWith(null)
      .subscribe(this.handleResize)
  }

  render () {
    const {
      ballPosition,
      ballVelocity,
      ballRadius,
      paddle1Position,
      paddle1Velocity,
      paddle1Dimensions,
      paddle2Position,
      paddle2Velocity,
      paddle2Dimensions,
      gamePaused,
      gameScore,
      windowSize
    } = this.props

    const windowDimensions = { x: windowSize.width, y: windowSize.height }

    return (
      <div>
        <Stage width={windowSize.width} height={windowSize.height}>
          <Layer>
            <Grid width={windowSize.width} height={windowSize.height} {...normalizeOrigin({ x: 0, y: 0 }, windowDimensions, windowDimensions)} />
            <Ball radius={ballRadius} {...normalizeOrigin(ballPosition, { x: 0, y: 0 }, windowDimensions)} />
            <Paddle width={paddle1Dimensions.x} height={paddle1Dimensions.y} {...normalizeOrigin(paddle1Position, paddle1Dimensions, windowDimensions)} />
            <Paddle width={paddle1Dimensions.x} height={paddle1Dimensions.y} {...normalizeOrigin(paddle2Position, paddle2Dimensions, windowDimensions)} />
          </Layer>
        </Stage>
        <pre style={{ backgroundColor: '#eee' }}>
          {JSON.stringify(this.props, null, 2)}
        </pre>
      </div>
    )
  }
}

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch) => ({
  setGamePaused: makeDispatcher(dispatch, setGamePaused),
  setPaddle1Velocity: makeDispatcher(dispatch, setPaddle1Velocity),
  setPaddle2Velocity: makeDispatcher(dispatch, setPaddle2Velocity),
  setWindowSize: makeDispatcher(dispatch, setWindowSize),
  requestUpdateGameState: makeDispatcher(dispatch, requestUpdateGameState)
})

const connectStore = connect(mapStateToProps, mapDispatchToProps)

const decorate = multidecorator(connectStore, Radium)

export default decorate(Pong)
