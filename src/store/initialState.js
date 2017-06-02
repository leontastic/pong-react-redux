import toRadians from '../utils/toRadians'

const initialState = {
  ballPosition: { x: 0, y: 0 },
  ballRadius: 10,
  ballVelocity: { x: Math.cos(toRadians(60)), y: Math.sin(toRadians(60)) },
  gamePaused: true,
  gameSpeed: 3,
  paddle1Dimensions: { x: 100, y: 20 },
  paddle1Position: { x: 0, y: 100 },
  paddle1Score: 0,
  paddle1Velocity: { x: 0, y: 0 },
  paddle2Dimensions: { x: 100, y: 20 },
  paddle2Position: { x: 0, y: -100 },
  paddle2Score: 0,
  paddle2Velocity: { x: 0, y: 0 }
}

export default initialState
