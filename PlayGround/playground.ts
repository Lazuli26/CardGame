import { carta, modifier, gameEvent, side, condition } from "./types";

enum PlacesToLook {
  All,
  Board,
  Hand,
  Deck,
}

const getAllCardAttacks = (events: Array<gameEvent>, selfCard: carta) =>
  events.filter(
    (event) => event.cardId == selfCard.id && event.action == "attack"
  );

const conditions: { [key: string]: condition } = {
  isPlaced: (game: partida, selfCard: carta, self: modifier) =>
    !!game.board[0].slots.find((card) => card == selfCard) ||
    !!game.board[1].slots.find((card) => card == selfCard),
  newTurn: (game: partida, selfCard: carta, self: modifier) =>
    game.turn != self.memory["lastTurnActivated"],
  card_Attacked: (
    game: partida,
    selfCard: carta,
    self: modifier,
    currentEvent
  ) => currentEvent.action == "attack" && currentEvent.cardId == selfCard.id,
};

const copyModifier = (modifier: modifier): modifier => ({
  ...modifier,
  memory: { ...modifier.memory },
});

const modifiers: { [key: string]: modifier } = {
  poisonDamage: {
    key: "poisonDamage",
    name: "envenenado",
    description: "Esta criatura recibe daño cada turno",
    condition: (...a) =>
      conditions["isPlaced"](...a) && conditions["newTurn"](...a),
    effect: (game, card, self) => {
      game.addEvent({
        action: "damage",
        cardId: card.id,
        targetId: card.id,
        values: {
          amount: self.memory["posionDamage"],
        },
      });
      self.memory["lastTurnActivated"] = game.turn;
      return null;
    },
    memory: {
      poisonDamage: 1,
    },
    type: "passive",
  },
  venomous: {
    type: "passive",
    condition: conditions["card_Attacked"],
    effect: (game, card, self, event) => {
      const targetCard = getCardByID(game, event.targetId, [
        PlacesToLook.Board,
      ]);

      game.addEvent({
        cardId: card.id,
        targetId: targetCard.id,
        action: "inscribe",
        values: {
          modifier: copyModifier(modifiers.poisonDamage),
        },
      });
      return null;
    },
    memory: {},
    name: "veneno",
    description: "Esta carta inflinge veneno a las cartas que ataque",
  },
};

// Podemos hacer que atacar se realice mediante un modificador de habilidad activa

const getCardByID = (
  game: partida,
  id: number,
  placesToLook: PlacesToLook[] = [PlacesToLook.All]
): carta | null => {
  for (let index = 0; index < 2; index++) {
    if (
      placesToLook.find(
        (place) => place == PlacesToLook.All || place == PlacesToLook.Hand
      )
    ) {
      const foundInHand = game.board[index].player.hand.find(
        (card) => card.id == id
      );
      if (foundInHand) return foundInHand;
    }

    if (
      placesToLook.find(
        (place) => place == PlacesToLook.All || place == PlacesToLook.Deck
      )
    ) {
      const foundInDeck = game.board[index].player.deck.find(
        (card) => card.id == id
      );
      if (foundInDeck) return foundInDeck;
    }

    if (
      placesToLook.find(
        (place) => place == PlacesToLook.All || place == PlacesToLook.Board
      )
    ) {
      const foundInBoard = game.board[index].slots.find(
        (card) => card.id == id
      );
      if (foundInBoard) return foundInBoard;
    }
  }
  return null;
};

const serpiente: carta = {
  name: "Cerpiente",
  description: "Mortal y golosa",
  attack: 1,
  eternalModifiers: [modifiers["venomous"]],
};

export class jugador {
  hand: Array<carta>;
  deck: Array<carta>;
  PlayerCard: Array<carta>;
  constructor(mazo: Array<carta>, PlayerCard: Array<carta>) {
    this.deck = mazo;
    this.PlayerCard = PlayerCard
  }
}

export class partida {
  registry: Array<gameEvent>;
  eventStack: gameEvent[];
  board: [side, side];
  turn: number;
  constructor(players: [jugador, jugador]) {
    this.board = players.map(
      (player) =>
      ({
        player,
        slots: [null, null, null, null, null],
      } as side)
    ) as [side, side];
    this.turn = 1;
    this.registry = new Array<gameEvent>();
    this.eventStack = new Array<gameEvent>()
  }

  runStack() {
    while (this.eventStack.length != 0) {
      const currentEvent = this.eventStack.pop();

      if (currentEvent) {
        switch (currentEvent.action) {
          // Deal damage
          case "attack": {
            this.addEvent({ ...currentEvent, action: "damage" })
            break;
          }
          // Damage dealt without attacking
          case "damage": {
            const targetCard = getCardByID(this, currentEvent.targetId, [
              PlacesToLook.Board,
            ]);
            targetCard.life -= currentEvent.values["amount"];
            break;
          }
          case "inscribe": {
            const targetCard = getCardByID(this, currentEvent.targetId);
            const modifier: modifier = currentEvent.values["modifier"];

            if (targetCard && modifier) {
              if (
                ![...targetCard.eternalModifiers, ...targetCard.modifiers].find(
                  (modifier) => modifier.key == modifier.key
                )
              ) {
                targetCard.modifiers.push(modifier);

                console.log(
                  `Modifier ${modifier.name} was applied to card ${targetCard.name}`
                );
              } else
                console.log(
                  `This card already has the modifier "${modifier.name}"`
                );
            } else console.log("Either the card or the modifier was not found");
            break;
          }
          default:
            break;
        }
        this.registry.push(currentEvent);
      }
    }
  }

  addEvent(currentEvent: gameEvent) {

    // Event is added to the event stack 
    this.eventStack.push(currentEvent);
    // Event index is recorded
    const eventIndex = this.eventStack.length - 1

    // Scan for passive modifiers
    for (let sideIndex = 0; sideIndex < this.board.length; sideIndex++) {
      const side = this.board[sideIndex];

      // Look for cards on this side
      const sideCards: (carta | null)[] = [
        // Look in player card
        ...side.player.PlayerCard,
        // Look in hand
        ...side.player.hand,
        // Look in deck
        ...side.player.deck,
        // Look in field
        ...side.slots,
      ];


      sideCards.forEach((checkingCard) => {
        if (checkingCard) {
          // Check all modifiers
          [...checkingCard.eternalModifiers ?? [], ...checkingCard.modifiers ?? []].forEach(
            (modifier) => {
              if (
                modifier.condition(this, checkingCard, modifier, this.eventStack[eventIndex])
              ) {

                // The event could be modified by a passive events designed to catch an specific event
                this.eventStack[eventIndex] =
                  modifier.effect(this, checkingCard, modifier, this.eventStack[eventIndex]) ??
                  this.eventStack[eventIndex];
              }
            }
          );
        }
      });
    }

    // Only the addEvent with eventIndex 0 can run the stack

    if (eventIndex == 0)
      this.runStack();
  }

  partida() { }
}
