import Radium from 'radium'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import Pong from './components/Pong'
import store from './store'
import './App.css'

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <Pong />
      </Provider>
    )
  }
}

export default Radium(App)
