import User from "../schema/models/user.js"
import { hashPassword } from "../utilities/registerUtilities.js";
import { getDateString } from "../utilities/timeUtilities.js";
import { UserInputError } from "apollo-server";
import { currentStatus } from "../controllers/statusController.js"

export async function getPopulatedUser(userId, username=null){
  if(username == null){
    return await User.findById(userId).populate(
      [{
        path: 'cards.card', 
        model: 'Card',
        populate:[{ path: 'game', model: 'Game' }]
      },
      {
        path: 'stats.usedCards.card', 
        model: 'Card',
        populate:[{ path: 'game', model: 'Game' }]
      },
    {
      path: 'stats.favoriteCard', 
        model: 'Card',
        populate:[{ path: 'game', model: 'Game' }]
    }]
    )
  }
  else{
    return await User.findOne({username}).populate(
      [{
        path: 'cards.card', 
        model: 'Card',
        populate:[{ path: 'game', model: 'Game' }]
      },
      {
        path: 'stats.usedCards.card', 
        model: 'Card',
        populate:[{ path: 'game', model: 'Game' }]
      },
    {
      path: 'stats.favoriteCard', 
        model: 'Card',
        populate:[{ path: 'game', model: 'Game' }]
    }]
    )
  }
}

export function mergeNewCards(user, newCards) {
  newCards.forEach(newCard => {
    if(user.cards.length > 0){
      let exist = false;
      user.cards.forEach(userCard => {
        if(userCard.card.id == newCard.card.id){
          userCard.quantity = userCard.quantity + newCard.quantity
          exist = true
        }
      });

      if(!exist){
        user.cards = user.cards.concat(newCard)
      }
    }
    else{
      user.cards = user.cards.concat(newCard)
    }
  });
  return user;
}

export async function getDefaultUser(){
  let { appUsername } = await currentStatus();
  let defaultUser = await User.findOne({ username: appUsername });
  if (defaultUser == null) {
    defaultUser = createNewUser(appUsername, "defaultPassword");
  }
  return defaultUser;
}

export async function createNewUser(username, password){
  const user = new User({
    username: username,
    passwordHash: hashPassword(password),
    status: "ACTIVE",
    stats: {
      creationDate: getDateString(),
      favoriteCard: null,
      totalOpenings: 0,
      totalCardUses: 0,
      usedCards: [],
    }, 
    cards: []
  });
  return user.save().catch((error) => {
    throw new UserInputError(error.message, {
      invalidArgs: args,
    });
  });
}

export function discountUserCards(user, card, quantity){
  const usedFragments = quantity * card.fragments

  user.cards.forEach(userCard => {
    if(userCard.card.id == card.id){
      userCard.quantity = userCard.quantity - usedFragments
    }
  });

  if(user.stats.usedCards.length > 0){
    let exist = false;
    user.stats.usedCards.forEach(usedCard => {
      if(usedCard.card.id == card.id){
        usedCard.quantity = usedCard.quantity + quantity
        exist = true
      }
    });

    if(!exist){
      user.stats.usedCards = user.stats.usedCards.concat({card, quantity})
    }
  }
  else{
    user.stats.usedCards = user.stats.usedCards.concat({card, quantity})
  }

  user.stats.totalCardUses = user.stats.totalCardUses + quantity
  user.stats.favoriteCard = updateFavoriteCard(user.stats.usedCards)
  user.save()
}

function updateFavoriteCard(usedCards){
  let favoriteCard = {
    card: null,
    quantity: 0
  }

  usedCards.forEach(usedCard => {
    if(usedCard.quantity > favoriteCard.quantity){
      favoriteCard = usedCard
    }
  });

  return favoriteCard.card
}