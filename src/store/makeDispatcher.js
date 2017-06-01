// create a function that forwards arguments to the action creator,
// then calls the given dispatch function on the created action

const makeDispatcher = (dispatch, actionCreator) => {
  const dispatcher = (...args) => { dispatch(actionCreator(...args)) }
  return dispatcher
}

export default makeDispatcher
