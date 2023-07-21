const { spec, response } = require("pactum");
const { expect } = require("chai");

const cardValues = {
  ACE: 11,
  KING: 10,
  QUEEN: 10,
  JACK: 10,
  10: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
};

describe("functional tests", () => {
  it("site should be up", async () => {
    await spec().get("https://deckofcardsapi.com/").expectStatus(200);
  });

  it("should get a new deck", async () => {
    let response = await spec()
      .get("https://deckofcardsapi.com/api/deck/new/")
      .expectStatus(200);

    expect(response.json.success).to.be.true;
  });

  it("should shuffle a deck", async () => {
    let response = await spec()
      .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .expectStatus(200);

    expect(response.json.success).to.be.true;
  });
});

describe("End to End", () => {
  it("should play blackjack with 2 players", async () => {
    let deckId;

    //Get a new deck
    let responseDeck = await spec()
      .get("https://deckofcardsapi.com/api/deck/new/")
      .expectStatus(200);

    expect(responseDeck.json.success).to.be.true;
    deckId = responseDeck.json.deck_id;

    //Shuffle Deck
    let responseShuffle = await spec()
      .get("https://deckofcardsapi.com/api/deck/" + deckId + "/shuffle/")
      .expectStatus(200);

    expect(responseShuffle.json.success).to.be.true;

    //Draw cards and assign to players
    await drawCardAssignPile("player1", deckId);
    await drawCardAssignPile("player2", deckId);
    await drawCardAssignPile("player1", deckId);
    await drawCardAssignPile("player2", deckId);

    //Get pile for player 1 and calculate hand
    let responseDealt1 = await spec()
      .get(
        "https://deckofcardsapi.com/api/deck/" + deckId + "/pile/player1/list/"
      )
      .expectStatus(200);

    expect(responseDealt1.json.success).to.be.true;
    //console.log(responseDealt1.json.piles.player1);
    let player1Card1 = responseDealt1.json.piles.player1.cards[0].value;
    let player1Card2 = responseDealt1.json.piles.player1.cards[1].value;
    let player1Total = cardValues[player1Card1] + cardValues[player1Card2];
    console.log(
      "player1 cards: ",
      player1Card1,
      player1Card2,
      //cardValues[player1Card1],
      //cardValues[player1Card2],
      player1Total
    );

    //Get pile for player 2 and calculate hand
    let responseDealt2 = await spec()
      .get(
        "https://deckofcardsapi.com/api/deck/" + deckId + "/pile/player2/list/"
      )
      .expectStatus(200);

    expect(responseDealt2.json.success).to.be.true;
    //console.log(responseDealt2.json.piles.player2);
    let player2Card1 = responseDealt2.json.piles.player2.cards[0].value;
    let player2Card2 = responseDealt2.json.piles.player2.cards[1].value;
    let player2Total = cardValues[player2Card1] + cardValues[player2Card2];
    console.log(
      "player2 cards: ",
      player2Card1,
      player2Card2,
      //cardValues[player2Card1],
      //cardValues[player2Card2],
      player2Total
    );

    //Check calculations for blackjack
    if (player1Total === 21) {
      console.log("Player 1 Blackjack!");
    }

    if (player2Total === 21) {
      console.log("Player 2 Blackjack!");
    }
  }).timeout(5000);
});

//Function that draws a card from a deck and assigns it to a players pile.
async function drawCardAssignPile(playerName, deckId) {
  //Draw a card from the deck
  let responseDraw = await spec()
    .get("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
    .expectStatus(200);

  expect(responseDraw.json.success).to.be.true;
  let card = responseDraw.json.cards[0].code;

  //assign card to player pile
  let responsePile = await spec()
    .get(
      "https://deckofcardsapi.com/api/deck/" +
        deckId +
        "/pile/" +
        playerName +
        "/add/?cards=" +
        card
    )
    .expectStatus(200);

  expect(responsePile.json.success).to.be.true;
}
