const makeSetterReducer = (actionName, initial = {}) => {
  return (state = initial, { type, payload }) => {
    if (type === actionName && payload !== undefined) return payload
    return state
  }
}

export default makeSetterReducer
