export const getTwitchRewards = async (channel: string) => {
  const gqlReq = `[
      {
      "operationName": "ChannelPointsContext",
      "variables": {
          "channelLogin": "${channel}",
          "includeGoalTypes": [
              "CREATOR",
              "BOOST"
          ]
      },
      "extensions": {
              "persistedQuery": {
                  "version": 1,
                  "sha256Hash": "1530a003a7d374b0380b79db0be0534f30ff46e61cffa2bc0e2468a909fbc024"
              }
          }
      }
  ]`;

  const clientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

  return await (
    await fetch('https://gql.twitch.tv/gql', {
      headers: {
        'client-id': clientId,
      },
      body: gqlReq,
      method: 'POST',
    })
  ).json();
};
