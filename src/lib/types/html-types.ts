export type HTMLTag = keyof HTMLElementTagNameMap
export type HTMLAttribute<Tag extends HTMLTag> = Partial<
    Omit<HTMLElementTagNameMap[Tag], keyof Element>
>;