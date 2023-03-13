export const getUrlFromString = (text: string) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return text.match(urlRegex);
};
