export const replaceString = (text: string, ...remove: string[]) => {
  let result = text;
  remove.forEach((item) => (result = result.split(item).join("").trim()));
  return result;
};

export default replaceString;
