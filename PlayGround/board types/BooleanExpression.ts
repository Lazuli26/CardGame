import { Accessor } from "./Accessor";

export type AND = {
    type: "AND",
    values: BooleanExpression[]
}

export type OR = {
    type: "OR",
    values: BooleanExpression[]
}

export type NOT = {
  type: "NOT";
  value: BooleanExpression;
};

export type Equals = {
    type: "=",
    values: Accessor[]
}

export type BooleanAccessor = {
    type: "BooleanAccessor"
} & Accessor

export type Inequity = {
    type: "<" | "<=" | ">=" | ">",
    values: [Accessor, Accessor],
}

export type BooleanExpression = AND | OR | NOT | Equals | Inequity | BooleanAccessor;