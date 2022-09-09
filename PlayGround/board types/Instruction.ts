import { CardAccessor } from "./Accessor"
import { BooleanExpression } from "./BooleanExpression"
import { CardFX } from "./CardTemplate"

export type SendToHand = {
    Cards: CardAccessor[],
    Condition?: BooleanExpression
}

export type ApplyEffect = {
    Cards: CardAccessor[],
    Effect:  CardFX,
    Dupplicable: boolean
}

export type Instruction = SendToHand

export type InstructionSet = Instruction[]