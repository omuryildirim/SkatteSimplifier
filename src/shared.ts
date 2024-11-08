export const stringifyJSON = (json: unknown) => {
  return JSON.stringify(json, null, 2);
};
