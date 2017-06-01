import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setGamePaused } from '../actions'
import makeDispatcher from '../store/makeDispatcher'

class Pong extends Component {
  constructor (...props) {
    super(...props)

    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleKeyPress (event) {
    if (event.keyCode === 32) { // space bar
      this.props.setGamePaused(!this.props.gamePaused)
    }
  }

  componentWillMount () {
    document.addEventListener('keypress', this.handleKeyPress)
  }

  componentWillUnmount () {
    document.removeEventListener('keypress', this.handleKeyPress)
  }

  render () {
    const { props } = this
    return (
      <div>{JSON.stringify(props, null, 2)}</div>
    )
  }
}

const mapStateToProps = (state) => ({ ...state })

const mapDispatchToProps = (dispatch) => ({
  setGamePaused: makeDispatcher(dispatch, setGamePaused)
})

export default connect(mapStateToProps, mapDispatchToProps)(Pong)
