import { BooleanExpression } from "./BooleanExpression";
import { InstructionSet } from "./Instruction";


export interface CardFX {
    Name: string,
    type: "active" | "passive",
    condition: BooleanExpression,
    Effect: InstructionSet
}
export type CardTag = string;

export type CardTemplate = {
    Name: string,
    FixedEffects: CardFX[],
    Effects: CardFX[],
    Tags: CardTag[],
    Memory: { [key: string]: any }
}


export interface CardInstance extends CardTemplate {
    CardID: number
}


const condition_currentCardIsAttacking : BooleanExpression = {
    type: "AND",
    values: [
        {
            type: "=",
            values: [
                { type: "DirectValueAccessor", value: "attack" },
                {
                    type: "EventAttributeAccessor", attribute: "Name", event: {
                        type: "GetCurrentEvent"
                    }
                }
            ]
        },
        {
            type: "=",
            values: [
                { type: "EventAttributeAccessor", attribute: "CasterCardId", event: {
                    type: "GetCurrentEvent"
                } },
                { type: "ParentCardAttributeAccessor", attribute: "CardID" }
            ]
        }
    ]
}

const Serpiente: CardTemplate = {
    Name: "Cerpiente",
    FixedEffects: [
        {
            Name: "Venenoso",
            type: "passive",
            condition: condition_currentCardIsAttacking,
            Effect: []
        },
    ],
    Effects: [],
    Tags: [],
    Memory: {}
}