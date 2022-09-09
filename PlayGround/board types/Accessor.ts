import { CardInstance, CardTag, CardTemplate } from "./CardTemplate";
import { GameEvent } from "./Event";


export interface CurrentEvent {
    type: "GetCurrentEvent"
}

export type EventAccesor = CurrentEvent;

export type getCardByID = {
    type: "GetCardByID",
    ID: string
}

export type CardAccessor = getCardByID;

export type GetEffectByID = {
    type: "GetEffectByID";
    ID: string;
};

export type GetFirstEffectByName = {
  type: "GetFirstEffectByName";
    Card: CardAccessor;
    EffectName: string;
};

export type EffectAccessor = GetEffectByID | GetFirstEffectByName

export type MemoryAccessor = {
    type: "MemoryAccessor";
    memorySource: EffectAccessor | EventAccesor;
    key: string;
};

export interface DirectValueAccessor {
    type: "DirectValueAccessor";
    value: number | boolean | string | DirectValueAccessor[] | {[key: string]: DirectValueAccessor}
}

export interface EventAttributeAccessor {
    type: "EventAttributeAccessor";
    attribute: keyof GameEvent;
    event: EventAccesor
}

export interface ParentCardAttributeAccessor {
    type: "ParentCardAttributeAccessor",
    attribute: keyof CardInstance
}

export type Accessor = MemoryAccessor | EventAccesor | CardAccessor | EffectAccessor | DirectValueAccessor | EventAttributeAccessor | ParentCardAttributeAccessor