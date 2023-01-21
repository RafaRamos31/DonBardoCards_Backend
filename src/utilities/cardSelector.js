import { throwCustomError } from "./errorHandler.js";

/**
 * @typedef {Object} PickedCard
 * @property {Card} card The selected card object
 * @property {Number} quantity The amount of cards drawed
*/

/**
 * Return a selected group of cards from a Card Collection, in base to some factors like the rarity from the cards, of the fixed cards to get.
 * @param  {Card[]} cardSet the list of selected cards to mix and draw some copies
 * @param  {Number} quantity the amount of cards to return
 * @param  {Object[]} fixedCards an optional array with the fixed amount of cards from a specific rarity to draw
 * @param  {String} fixedCards.cardType the value of the rarity of the card
 * @param  {Number} fixedCards.quantity the amount of cards of the fixed rarity to draw
 * @param  {Object[]} rarityWeights an array with the app-defined quantity of copies to shuffle of every card depending of its rarity
 * @param  {String} rarityWeights.cardType the name of the possible card rarity
 * @param  {Number} rarityWeights.weight the number of copies to shuffle of a specific rarity, more weight makes more probable to draw a card of that rarity
 * @return {PickedCard[]}      the list of selected cards with the object reference and the quantity of every card
 */
export function drawCards(cardSet, quantity, fixedCards=null, rarityWeights) {
  /** @type {PickedCard[]} */
  let pickedCards = [];

  if (fixedCards != null) {
    fixedCards.forEach((fixedCard) => {
      //Get only the cards of a certain rarity and draw the requested amount of cards
      let fixedCardSet = cardSet.filter(card => card.rarity == fixedCard.cardType)
      pickedCards = pickedCards.concat(
        generateCards(
          fixedCardSet,
          fixedCard.quantity,
          rarityWeights
        )
      );
      //Substract the fixed copies amount for the total cards of the lootbag
      quantity -= fixedCard.quantity;
    });
  }
  
  //Draw cards from the remain quantity after the fixed cards if there were
  pickedCards = pickedCards.concat(generateCards(cardSet, quantity, rarityWeights))
  return pickedCards;
}

/**
 * Return a selected group of cards from a subset of the original Card Collection.
 * @param  {Card[]} cards the list of selected cards to mix and draw some copies
 * @param  {Number} quantity the amount of cards to return
 * @param  {Object[]} rarityWeights an array with the app-defined quantity of copies to shuffle of every card depending of its rarity
 * @param  {String} rarityWeights.cardType the name of the possible card rarity
 * @param  {Number} rarityWeights.weight the number of copies to shuffle of a specific rarity, more weight makes more probable to draw a card of that rarity
 * @return {PickedCard[]}      the list of selected cards with the object reference and the quantity of every card
 */
function generateCards(cards, quantity, rarityWeights) {
  /** @type {String[]} */
  let deck = [];
  /** @type {PickedCard[]} */
  let pickeds = [];

  //creates a "deck" with multiples copies of the ID for the selected cards
  cards.forEach((card) => {
    deck = deck.concat(generateCopies(card, rarityWeights));
  });
  
  //Preventing the app to fail if the amount of requested cards is bigger than the generated cards in the deck
  if(deck.length<quantity) throwCustomError('Not enough existent cards', 'NOT_ENOUGH_CARDS_ERROR')

  deck = shuffle(deck);
  
  //Select the first card of the shuffled deck and remove it, repeat depending of the amount of cards requested
  for (let i = 0; i < quantity; i++) {
    pickeds = addCard(pickeds, cards, deck[0]);
    deck.splice(0, 1)
  }

  //Before returning the selected cards, group the duplicated ones
  return groupDuplicates(pickeds)
}

/**
 * Returns an Array with multiple copies of the ID of a specific card, depending of the rarity of that card
 * @param  {Card} card the card to generate copies
 * @param  {Object[]} rarityWeights an array with the app-defined quantity of copies to shuffle of every card depending of its rarity
 * @param  {String} rarityWeights.cardType the name of the possible card rarity
 * @param  {Number} rarityWeights.weight the number of copies to shuffle of a specific rarity, more weight makes more probable to draw a card of that rarity
 * @return {String[]}      an array with multiple copies of the card ID
 */
function generateCopies(card, rarityWeights) {
  /** @type {String[]} */
  let cardIndexs = [];
  let copiesNum = 0;

  let rarityWeight = rarityWeights.find(e => e.cardType == card.rarity)
  if(rarityWeight != null){
    copiesNum = rarityWeight.weight
  }

  //It's not posible to shuffle a card more times than the remain existences it has
  if(card.limited != null){
    if(card.limited.existences < copiesNum){
      copiesNum = card.limited.existences
    }
  }

  //Adding the copies to an array of indexes
  for (let i = 0; i < copiesNum; i++) {
    cardIndexs = cardIndexs.concat(card.id)
  }

  return cardIndexs
}

/**
 * Change the order of the multiple copies of the card indexes of the deck
 * @param  {String[]} array the deck with multiple card ID's
 * @return {String[]}      an randomly shuffled version of the deck
 */
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

/**
 * Add a select Card Object to the array of picked cards
 * @param  {PickedCard[]} pickedCards the current picked card objects
 * @param  {Card[]} allCards an array with one copy of every card object involved in the selection process
 * @param  {String} cardId the ID of the selected card to be added to the picked cards array
 * @return {PickedCard[]}      the picked cards array plus a new selected card
 */
function addCard(pickedCards, allCards, cardId){
  let card = allCards.filter((c) => c.id == cardId)
  if(card != null){
    //creates a new object containing the card object and a fixed amount of 1, the number can change later if more copies of this card are selected
    pickedCards = pickedCards.concat({
      card: card[0],
      quantity: 1
    })
  }
  return pickedCards
}

/**
 * Combine diferentes copies of the same card-quantity objects in only one, just increasing the quantity
 * @param  {PickedCard[]} pickedCards the final selected cards for a cards subset
 * @return {PickedCard[]}      a reduced version of the array, without duplicated cards
 */
function groupDuplicates(pickedCards){
  /** @type {PickedCard[]} */
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
      //If there is no copies of the card, the object is added to the array
      if(!exist){
        groupedCards = groupedCards.concat(pickedCard)
      }
    }
    //The first card always enter the array
    else{
      groupedCards = groupedCards.concat(pickedCard)
    }
  });
  return groupedCards
}
