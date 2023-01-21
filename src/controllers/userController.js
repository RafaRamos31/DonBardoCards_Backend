import User from "../schema/models/user.js";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utilities/registerUtilities.js";
import { getDateString } from "../utilities/timeUtilities.js";
import { throwCustomError, throwInvalidArgsError, throwInvalidIDError, throwUserInputError } from "../utilities/errorHandler.js";
import { getCurrentStatus } from "../controllers/statusController.js";

/**
 * Return a specific User from the database using the cardId
 * @param {String} userId the id of the User to find
 * @return {User | null}      the founded User object
 */
export async function findUserById(userId) {
  return await User.findById(userId)
    .populate([
      {
        path: "cards.card",
        model: "Card",
        populate: [{ path: "game", model: "Game" }],
      },
      {
        path: "stats.usedCards.card",
        model: "Card",
        populate: [{ path: "game", model: "Game" }],
      },
      {
        path: "stats.favoriteCard",
        model: "Card",
        populate: [{ path: "game", model: "Game" }],
      },
    ])
    .catch(() => { throwInvalidIDError('User') });
}

/**
 * Return a specific User from the database using the unique username
 * @param {String} username the username of the User to find
 * @return {User | null}      the founded User object
 */
export async function findUserByName(username) {
  return await User.findOne({ username }).populate([
    {
      path: "cards.card",
      model: "Card",
      populate: [{ path: "game", model: "Game" }],
    },
    {
      path: "stats.usedCards.card",
      model: "Card",
      populate: [{ path: "game", model: "Game" }],
    },
    {
      path: "stats.favoriteCard",
      model: "Card",
      populate: [{ path: "game", model: "Game" }],
    },
  ]);
}

/**
 * Register a new User Object in the Database
 * @param {String} username the username for the user
 * @param {String} password  the password ingresed by the user
 * @return {User}      the generated User object
 */
export async function createNewUser(username, password) {
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
    cards: [],
  });
  return user.save().catch((error) => {
    throwInvalidArgsError(error.message, {username, password});
  });
}

/**
 * Creates a new User to use in the Application, or update an existing incomplete user
 * @param {String} username the name for the user
 * @param {String} password the password entered by the user
 * @return {Card}      the new created user
 */
export async function registerUser(username, password) {
  const existent = await findUserByName(username);
  if (existent) {
    if (!existent.passwordHash) {
      existent.passwordHash = hashPassword(password);
      return existent.save();
    } else {
      throwCustomError("Already registered account.", "EXISTENT_ACCOUNT_ERROR");
    }
  }
  return createNewUser(username, password);
}

/**
 * Validate the auth credentials entered by an user
 * @param {String} username the name from the user
 * @param {String} password the password entered by the user
 * @return {Card}      the validation Token
 */
export async function loginUser(username, password) {
  const user = await User.findOne({ username });

  if (!user || user.passwordHash != hashPassword(password))
    throwUserInputError("Wrong credentials.");

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  return {
    value: jwt.sign(userForToken, process.env.JWT_SECRET),
  };
}


/**
 * Returns the default defined by the app user, used to generate free rewards, if it doesn't exist, creates it
 * @return {User}      the default user
 */
export async function getDefaultUser() {
  let { appUsername, appUserPassword } = await getCurrentStatus();
  let defaultUser = await findUserByName(appUsername);
  defaultUser = defaultUser
    ? defaultUser
    : createNewUser(appUsername, appUserPassword);
  return defaultUser;
}

/**
 * Changes the name from the default user from the app
 * @param {String} username the new name for the user
 */
export async function editDefaultUser(username, password) {
  let { appUsername } = await getCurrentStatus();
  let defaultUser = await findUserByName(appUsername);
  if(defaultUser){
    defaultUser.username = username
    defaultUser.hashPassword = hashPassword(password)
    defaultUser.save()
  }
  else{
    createNewUser(username, password);
  }
}

/**
 * Combines the existent user cards with new obtained cards
 * @param {User} user the user object to modify
 * @param {Array} newCards  an array with the card objects and the quantity of every card
 * @return {User}      the updated version of the user
 */
export function mergeNewCards(user, newCards) {
  newCards.forEach((newCard) => {
    if (user.cards.length > 0) {
      let exist = false;
      user.cards.forEach((userCard) => {
        if (userCard.card && userCard.card.id == newCard.card.id) {
          userCard.quantity = userCard.quantity + newCard.quantity;
          exist = true;
          newCard.new = false
        }
      });

      if (!exist) {
        user.cards = user.cards.concat(newCard);
        newCard.new = true
      }
    } else {
      user.cards = user.cards.concat(newCard);
      newCard.new = true
    }
  });
  return [user, newCards];
}

/**
 * Move the selected user cards to the usedCards section, and modify the favorite card, and total of used cards for the user
 * @param {User} user the user object to modify
 * @param {Card} card  the card object to update from the user cards
 * @param {Number} quantity  the amount of complete cards used by the user
 * @return {User}      the updated User object
 */
export function discountUserCards(user, card, quantity) {
  //in the user cards, the measure is fragments
  const usedFragments = quantity * card.fragments;

  //finding the used card
  user.cards.forEach((userCard) => {
    if (userCard.card && userCard.card.id == card.id) {
      userCard.quantity = userCard.quantity - usedFragments;
    }
  });

  //updating the usedCards section
  if (user.stats.usedCards.length > 0) {
    let exist = false;
    user.stats.usedCards.forEach((usedCard) => {
      if (usedCard.card.id == card.id) {
        usedCard.quantity = usedCard.quantity + quantity;
        exist = true;
      }
    });

    if (!exist) {
      user.stats.usedCards = user.stats.usedCards.concat({ card, quantity });
    }
  } else {
    user.stats.usedCards = user.stats.usedCards.concat({ card, quantity });
  }

  //updating the total card uses from the user
  user.stats.totalCardUses = user.stats.totalCardUses + quantity;

  //updating the favorite card
  user.stats.favoriteCard = updateFavoriteCard(user.stats.usedCards);

  user.save();
}

/**
 * Compare the usedCards array from a user, to find the card with more uses
 * @param {Object[]} usedCards the content of the usedCards property
 * @return {Card}      the most used card from the array
 */
function updateFavoriteCard(usedCards) {
  //Initial state
  let favoriteCard = {
    card: null,
    quantity: 0,
  };

  usedCards.forEach((usedCard) => {
    if (usedCard.quantity > favoriteCard.quantity) {
      favoriteCard = usedCard;
    }
  });

  return favoriteCard.card;
}

