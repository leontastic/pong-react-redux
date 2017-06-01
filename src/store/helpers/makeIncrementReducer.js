const makeIncrementReducer = (actionName, initial = 0) => {
  return (state = initial, { type }) => {
    if (type === actionName) return state + 1
    return state
  }
}

export default makeIncrementReducer
