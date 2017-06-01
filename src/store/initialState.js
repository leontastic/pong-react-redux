import toRadians from '../utils/toRadians'

const initialState = {
  ballPosition: { x: 0, y: 0 },
  ballVelocity: { x: Math.cos(toRadians(60)), y: Math.sin(toRadians(60)) },
  paddle1Position: { x: 0, y: 100 },
  paddle1Velocity: { x: 0, y: 0 },
  paddle2Position: { x: 0, y: -100 },
  paddle2Velocity: { x: 0, y: 0 },
  gamePaused: true,
  gameScore: 0
}

export default initialState
