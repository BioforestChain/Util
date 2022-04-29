export default (message: string, style: string) => {
  return ["%c" + message, style];
};
