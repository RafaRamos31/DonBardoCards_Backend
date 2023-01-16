import StreamStatus from "../schema/models/streamStatus.js";

export async function currentStatus(){
  let status = await StreamStatus.findOne({ ref: 1 }).populate([{path: 'currentGame', model: 'Game'}, {path: 'giftLootbag', model: 'LootBag'}]);
  if (status == null) {
    status = initializate();
  }
  return status;
};

function initializate(){
  const defaultStatus = new StreamStatus({
    ref: 1,
    isActive: false,
    currentGame: null,
    appUsername: 'anonymousGifter',
    defaultLootbag: null,
    rarityWeights: [
      {
        cardType: 'COMMON',
        weight: 10
      },
      {
        cardType: 'RARE',
        weight: 7
      },
      {
        cardType: 'EPIC',
        weight: 4
      },
      {
        cardType: 'LEGENDARY',
        weight: 2
      },
      {
        cardType: 'UNIQUE',
        weight: 1
      },
    ]
  })
  return defaultStatus.save()
}


