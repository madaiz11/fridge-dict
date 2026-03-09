declare const brandSymbol: unique symbol;

export type BrandedType<TValue, Label extends string> = TValue & {
  readonly [brandSymbol]: Label;
};
