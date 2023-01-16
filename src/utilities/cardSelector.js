export function drawCards(cardSet, quantity, fixedCards, rarityWeights) {
  let pickedCards = [];

  if (fixedCards != null) {
    fixedCards.forEach((fixedCard) => {
      let fixedCardSet = cardSet.filter(card => card.rarity == fixedCard.cardType)
      pickedCards = pickedCards.concat(
        generateCards(
          fixedCardSet,
          fixedCard.quantity,
          rarityWeights
        )
      );
      quantity -= fixedCard.quantity;
    });
  }
  
  pickedCards = pickedCards.concat(generateCards(cardSet, quantity, rarityWeights))
  return pickedCards;
}

function generateCards(cards, quantity, rarityWeights) {
  let deck = [];
  let pickeds = [];

  cards.forEach((card) => {
    deck = deck.concat(generateCopies(card, rarityWeights));
  });

  deck = shuffle(deck);

  for (let i = 0; i < quantity; i++) {
    pickeds = addCard(pickeds, cards, deck[0]);
    deck.splice(0, 1)
  }
  return groupDuplicates(pickeds)
}

function generateCopies(card, rarityWeights) {
  let copiesNum = 0;
  let cardIndexs = [];

  let rarityWeight = rarityWeights.find(e => e.cardType == card.rarity)
  if(rarityWeight != null){
    copiesNum = rarityWeight.weight
  }

  switch (card.rarity) {
    case "COMMON":
      copiesNum = rarityWeights[0].weight;
      break;
    case "RARE":
      copiesNum = rarityWeights[1].weight;
      break;
    case "EPIC":
      copiesNum = rarityWeights[2].weight;
      break;
    case "LEGENDARY":
      copiesNum = rarityWeights[3].weight;
      break;
    case "UNIQUE":
      copiesNum = rarityWeights[4].weight;
      break;
    default:
      copiesNum = 0;
      break;
  }

  if(card.limited != null){
    if(card.limited.existences < copiesNum){
      copiesNum = card.limited.existences
    }
  }

  for (let i = 0; i < copiesNum; i++) {
    cardIndexs = cardIndexs.concat(card.id)
  }

  return cardIndexs
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function addCard(pickedCards, allCards, cardId){
  let card = allCards.filter((c) => c.id == cardId)
  if(card != null){
    pickedCards = pickedCards.concat({
      card: card[0],
      quantity: 1
    })
  }
  return pickedCards
}

function groupDuplicates(pickedCards){
  let groupedCards = []

  pickedCards.forEach(pickedCard => {
    if(groupedCards.length > 0){
      let exist = false
      groupedCards.forEach(groupedCard => {
        if(groupedCard.card.id == pickedCard.card.id){
          groupedCard.quantity = groupedCard.quantity + 1
          exist = true
        }
      });

      if(!exist){
        groupedCards = groupedCards.concat(pickedCard)
      }
    }
    else{
      groupedCards = groupedCards.concat(pickedCard)
    }
  });
  return groupedCards
}
