import Radium from 'radium'
import React, { Component } from 'react'
import { Layer, Circle, Stage } from 'react-konva'
import { connect } from 'react-redux'
import multidecorator from 'react-multidecorator'
import { Observable, Scheduler } from 'rx-dom'

import { setGamePaused, animateGameState } from '../store/actions'
import makeDispatcher from '../store/helpers/makeDispatcher'

const Ball = ({ x, y }) => <Circle x={x} y={y} radius={5} fill='#a40000' />

class Pong extends Component {
  constructor () {
    super()

    this.handleKeyPress = this.handleKeyPress.bind(this)
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
            <Ball {...ballPosition} />
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
