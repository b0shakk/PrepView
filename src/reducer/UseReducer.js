export const report = "";
export const reportReducer = (state, action) => {
  if (action.type === "CHANGE") return action.payload;
  return state;
};
