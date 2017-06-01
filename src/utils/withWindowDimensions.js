import React, { Component } from 'react'
import { DOM, Subject, Scheduler } from 'rx-dom'

const withWindowDimensions = (Composed) => class extends Component {
  constructor () {
    super()

    this.state = {
      windowWidth: 0,
      windowHeight: 0
    }

    this.willUnmount = new Subject()

    this.resizeEvent = DOM.resize(window)
      .throttle(1, Scheduler.requestAnimationFrame)
      .takeUntil(this.willUnmount)
      .startWith(null)

    this.handleResize = this.handleResize.bind(this)
  }

  handleResize () {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  componentDidMount () {
    this.resizeEvent.subscribe(this.handleResize)
  }

  componentWillUnmount () {
    this.willUnmount.onNext()
    this.willUnmount.onCompleted()
  }

  render () {
    const { windowWidth, windowHeight } = this.state
    return <Composed {...this.props} windowWidth={windowWidth} windowHeight={windowHeight} />
  }
}

export default withWindowDimensions
