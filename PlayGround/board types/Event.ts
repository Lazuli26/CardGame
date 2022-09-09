

export type GameEvent = {
    type: "event",
    Name: string,
    CasterCardId: number | null;
    TargetCardId: number | null;
    Memory?: {
        [key: string]: any;
    };
}

export interface event_attack extends GameEvent  {
    Name: "attack";
    CasterCardId: number;
    TargetCardId: number;
    Memory: {
        Damage: number;
    }
}