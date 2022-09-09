import { jugador, partida } from "./playground";

// A condition is a function that returns a boolean
// Conditions are used by modifiers to determine if the effect is available
// They receive the game state, the card that hosts the parent modifier, the modifier themselves and the event that is currently triggering the check
export type condition = (
  board: partida,
  card: carta,
  self: modifier,
  eventTrigger?: gameEvent
) => boolean;

// An effect is a function that executes events while reading/modifying the memory of the modifier they are hosted in
// Passive modifiers automatically execute their effects if their condition is met
// Active modifiers execute their effect when the player activate them, the player may only activate a modifier if the modifier's condition is currently met
// They receive the game state, the card that hosts the parent modifier, the modifier themselves and the event that is triggering the effect
// Passive modifiers can modify the event that triggers them, this allows passive modifiers to intercept and change the result of an event
export type effect = (
  board: partida,
  card: carta,
  self: modifier,
  eventTrigger?: gameEvent
) => gameEvent | null;
// A modifier is hosted inside a card, modifiers can be either passive or active
// Active modifiers can be activated anytime their condition is met
// Passive effects activate anytime their condition is met
// If a modifier is passive, they can receive the event that triggered them and even modify it, serving as an event watcher
// (ie: if a card declares an "attack" event, this event can be changed by another card with a modifier that changes the event target, damage, etc)
// If a modifier returns null, that means that modifier is not designed to catch and modify events
// Modifiers are provided with their own memory in the case it is needed
// Modifiers have their own name and description
export type modifier = {
  type: "active" | "passive";
  condition: condition;
  effect: effect;
  memory?: { [key: string]: any };
  key?: string;
  name: string;
  description: string;
};

// Cards are entities that can be hosted inside decks, boards or hands
// They have a name, a description, life points, attack and modifiers
// Eternal modifiers can (and should) only be defined while on the card creation (they are permanent to the card)
export type carta = {
  id?: number;
  name: string;
  description: string;
  attack: number | null;
  life: number | null;
  modifiers?: modifier[];
  eternalModifiers?: modifier[];
};

// Game events describe any action that happens on the game
// Events can describe any event happening on the game, this is described on the "action" field
// Card may trigger or be the target of effects
// Some events may need to list extra information, this information is stored in the "values" field
export type gameEvent = {
  action: string;
  cardId: number | null;
  targetId: number | null;
  values?: {
    [key: string]: any;
  };
};

// A slot may be empty or occupied by a card
export type slot = carta | null;

// A side contains a player and a collection of slots
export type side = {
  player: jugador;
  slots: [slot?, slot?, slot?, slot?, slot?];
};
