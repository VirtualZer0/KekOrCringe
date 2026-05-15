export const badWords = [
  'nigger',
  'negr',
  'негр',
  'faggot',
  'пидр',
  'пидарас',
  'пидорас',
  'nude',
  'naked',
  'голый',
  'голая',
  'nazi',
  'breastfeeding',
  'кормление грудью',
  'грудное вскармливание',
  'lactation',
  'breast massage',
  'массаж груди',
  'anus',
  'анус',
];

export const containsBadWord = (text: string): boolean => {
  const lower = text.toLowerCase();
  return badWords.some((word) => lower.includes(word.toLowerCase()));
};
