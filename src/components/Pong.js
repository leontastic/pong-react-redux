import { isNumber, range, toNumber } from 'lodash'
import Radium from 'radium'
import React, { Component } from 'react'
import { Circle, Group, Layer, Rect, Stage, Text } from 'react-konva'
import { connect } from 'react-redux'
import multidecorator from 'react-multidecorator'
import { DOM, Observable, Scheduler } from 'rx-dom'
import Vector from 'victor'

import {
  setGamePaused,
  setGameSpeed,
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
    this.setGameSpeed = this.setGameSpeed.bind(this)
    this.toggleGamePause = this.toggleGamePause.bind(this)
  }

  handleResize () {
    this.props.setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }

  toggleGamePause () {
    this.props.setGamePaused(!this.props.gamePaused)
  }

  setGameSpeed (event) {
    const speed = event.target.value
    if (isNumber(toNumber(speed))) this.props.setGameSpeed(speed)
  }

  componentDidMount () {
    const nextAnimationFrame = Observable.interval(0, Scheduler.requestAnimationFrame)
      .timeInterval()
      .pluck('interval')
      .filter(() => !this.props.gamePaused)

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
      ballRadius,
      paddle1Position,
      paddle1Dimensions,
      paddle2Position,
      paddle2Dimensions,
      gamePaused,
      gameSpeed,
      paddle1Score,
      paddle2Score,
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
            <Group visible={gamePaused}>
              <Text text='PAUSED' align='center' width={200} height={30} fontSize={24} {...normalizeOrigin({ x: 0, y: -windowDimensions.y / 10 }, { x: 200, y: 30 }, windowDimensions)} />
              <Text text='Press SPACE to Play' align='center' width={200} height={30} fontSize={18} {...normalizeOrigin({ x: 0, y: windowDimensions.y / 10 }, { x: 200, y: 30 }, windowDimensions)} />
            </Group>
          </Layer>
        </Stage>
        <div key='score1' style={{ ...styles.score1, ...(gamePaused ? styles.opaque : {}) }}>
          <div style={{ fontSize: '1.5em' }}>Player 1 ({paddle1Score})</div>
          <div>Use &larr; and &rarr; to move your paddle</div>
        </div>
        <div key='score2' style={{ ...styles.score2, ...(gamePaused ? styles.opaque : {}) }}>
          <div style={{ fontSize: '1.5em' }}>Player 2 ({paddle2Score})</div>
          <div>Use Z and X to move your paddle</div>
        </div>
        <div style={styles.diagnostic}>
          Game Speed: <input style={styles.input} type='number' min={1} max={5} value={gameSpeed} onChange={this.setGameSpeed} />
          <pre key='diagnostic'>
            {JSON.stringify(this.props, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}

const scoreStyles = {
  position: 'absolute',
  color: 'white',
  fontSize: '1em',
  padding: '1em',
  textAlign: 'right',
  opacity: 0.2,
  transition: 'opacity 0.25s',
  ':hover': {
    opacity: 1
  }
}

const styles = {
  diagnostic: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'auto',
    margin: 0,
    padding: '1em',
    backgroundColor: '#eee',
    transition: 'opacity 0.25s',
    opacity: 0.1,
    ':hover': {
      opacity: 0.9
    }
  },
  score1: {
    ...scoreStyles,
    bottom: 0,
    right: 0,
    backgroundColor: '#a40000'
  },
  score2: {
    ...scoreStyles,
    top: 0,
    right: 0,
    backgroundColor: '#0000a4'
  },
  opaque: {
    opacity: 1
  },
  input: {
    fontSize: '1em',
    margin: '0.5em',
    padding: '0.25em'
  }
}

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch) => ({
  setGamePaused: makeDispatcher(dispatch, setGamePaused),
  setGameSpeed: makeDispatcher(dispatch, setGameSpeed),
  setPaddle1Velocity: makeDispatcher(dispatch, setPaddle1Velocity),
  setPaddle2Velocity: makeDispatcher(dispatch, setPaddle2Velocity),
  setWindowSize: makeDispatcher(dispatch, setWindowSize),
  requestUpdateGameState: makeDispatcher(dispatch, requestUpdateGameState)
})

const connectStore = connect(mapStateToProps, mapDispatchToProps)

const decorate = multidecorator(connectStore, Radium)

export default decorate(Pong)
