import Radium from 'radium'
import React, { Component } from 'react'
import { Layer, Circle, Rect, Stage } from 'react-konva'
import { connect } from 'react-redux'
import multidecorator from 'react-multidecorator'
import { Observable, Scheduler } from 'rx-dom'
import Vector from 'victor'

import { setGamePaused, animateGameState } from '../store/actions'
import makeDispatcher from '../store/helpers/makeDispatcher'

const Ball = ({ x, y, radius }) => <Circle x={x} y={y} radius={radius} fill='#a40000' />

const Paddle = ({ x, y, width, height }) => <Rect x={x} y={y} width={width} height={height} fill='black' />

class Pong extends Component {
  constructor () {
    super()

    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  fromCenter (vector, width = 0, height = 0) {
    vector = Vector.fromObject(vector)
    const { width: containerWidth, height: containerHeight } = this.props
    const origin = new Vector(containerWidth / 2, containerHeight / 2)
    const offset = new Vector(width / 2, height / 2)
    return vector.add(origin).subtract(offset).toObject()
  }

  handleKeyPress (event) {
    if (event.keyCode === 32) { // space bar
      this.props.setGamePaused(!this.props.gamePaused)
    }
  }

  componentDidMount () {
    const nextAnimationFrame = Observable.interval(0, Scheduler.requestAnimationFrame)
      .timeInterval()
      .pluck('interval')

    nextAnimationFrame.subscribe(this.props.animateGameState)
  }

  componentWillMount () {
    document.addEventListener('keypress', this.handleKeyPress)
  }

  componentWillUnmount () {
    document.removeEventListener('keypress', this.handleKeyPress)
  }

  render () {
    const {
      width = 700,
      height = 700,
      ballPosition,
      ballVelocity,
      paddle1Position,
      paddle1Velocity,
      paddle2Position,
      paddle2Velocity,
      gamePaused,
      gameScore
    } = this.props

    return (
      <div>
        <Stage width={width} height={height}>
          <Layer>
            <Ball radius={5} {...this.fromCenter(ballPosition, 5, 5)} />
            <Paddle width={100} height={20} {...this.fromCenter(paddle1Position, 100, 20)} />
            <Paddle width={100} height={20} {...this.fromCenter(paddle2Position, 100, 20)} />
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
  animateGameState: makeDispatcher(dispatch, animateGameState)
})

const connectStore = connect(mapStateToProps, mapDispatchToProps)

const decorate = multidecorator(connectStore, Radium)

export default decorate(Pong)
