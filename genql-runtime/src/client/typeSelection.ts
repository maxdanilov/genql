//////////////////////////////////////////////////

export type FieldsSelection<SRC extends Anify<DST>, DST> = {
    tuple: DST extends readonly [any, infer PAYLOAD]
        ? FieldsSelection<SRC, PAYLOAD>
        : never
    scalar: SRC
    union: Handle__isUnion<SRC, DST>
    object: Pick<
        {
            // using keyof SRC to maintain ?: relations of SRC type
            [Key in keyof SRC]: Key extends keyof DST
                ? FieldsSelection<SRC[Key], DST[Key]>
                : SRC[Key]
        },
        keyof DST
    >
    __scalar: Handle__scalar<SRC, DST>
    default: never
}[DST extends undefined
    ? 'default'
    : DST extends readonly [any, any]
    ? 'tuple'
    : SRC extends Scalar
    ? 'scalar'
    : DST extends boolean | number
    ? 'scalar'
    : SRC extends { __isUnion?: any }
    ? 'union'
    : DST extends { __scalar?: any }
    ? '__scalar'
    : DST extends {}
    ? 'object'
    : 'default']

type Handle__scalar<SRC extends Anify<DST>, DST> = SRC extends undefined
    ? never
    : Omit<
          Pick<
              // continue processing fields that are in DST, directly pass SRC type if not in DST
              {
                  [Key in keyof SRC]: Key extends keyof DST
                      ? FieldsSelection<SRC[Key], DST[Key]>
                      : SRC[Key]
              },
              // remove fields that are not scalars or are not in DST
              {
                  [Key in keyof SRC]: SRC[Key] extends Scalar
                      ? Key
                      : Key extends keyof DST
                      ? Key
                      : never
              }[keyof SRC]
          >,
          FieldsToRemove
      >

// TODO response union types are very dumb
type Handle__isUnion<SRC extends Anify<DST>, DST> = SRC extends undefined
    ? never
    : Omit<SRC, FieldsToRemove> // just return the union type

type Scalar = string | number | Date | boolean | null | undefined

type Anify<T> = { [P in keyof T]?: any }

type FieldsToRemove = '__isUnion' | '__scalar'
