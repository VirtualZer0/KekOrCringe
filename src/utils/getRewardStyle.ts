import { getCorrectFgColor } from './getCorrectFgColor';

export const getRewardStyle = (reward: any) => {
  if (!reward) return {};
  return {
    backgroundColor: reward.backgroundColor,
    borderColor: reward.backgroundColor,
    color: getCorrectFgColor(reward.backgroundColor),
  };
};
