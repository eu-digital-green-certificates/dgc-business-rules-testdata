export function mapValues<U, V>(map: { [key: string]: U }, mapper: (key: string, u: U) => V) {
    return Object.fromEntries(
        Object.entries(map).map(([ key, u ]) => [ key, mapper(key, u) ])
    )
}

export function filterValues<U, V>(map: { [key: string]: U }, predicate: (key: string, u: U) => V) {
    return Object.fromEntries(
        Object.entries(map).filter(([ key, u ]) => predicate(key, u))
    )
}

