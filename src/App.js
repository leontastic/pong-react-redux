import Radium from 'radium'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import multidecorator from 'react-multidecorator'
import Pong from './components/Pong'
import store from './store'
import withWindowDimensions from './utils/withWindowDimensions'
import './App.css'

class App extends Component {
  render () {
    const { windowWidth, windowHeight } = this.props

    return (
      <Provider store={store}>
        <Pong width={windowWidth} height={windowHeight} />
      </Provider>
    )
  }
}

const decorator = multidecorator(Radium, withWindowDimensions)

export default decorator(App)
