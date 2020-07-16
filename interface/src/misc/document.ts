export class DocSrc {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public markable_keys: Array<string>

    constructor(public raw: string, markables: Map<string, Array<[number, number]>> = new Map()) {
        this.markables = markables
    }

    public display(markable: string, index: number): string {
        let output = this.raw
        let indicies = this.markables.get(markable)[index]

        const STYLE_A = "<span class='waiter_p2_highlight_src'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])

        return output
    }

    public displaySimple(): string {
        return this.raw
    }

    public get_sections(markable: string): Array<[number, number]> {
        // creates a copy, because other code may modify it
        return this.markables.get(markable).map((value: [number, number]) => [value[0], value[1]])
    }
}

export class DocTgt {
    constructor(public raw: string) { }

    public display(doc_src: DocSrc, markable: string, index: number): string {
        let indicies: [number, number] = doc_src.get_sections(markable)[index]

        // Try to align by sentences
        let mkbRow = (doc_src.raw.substr(0, indicies[0]).match(/\n/g) || []).length
        let posA = this.raw.nthIndexOf("\n", mkbRow)
        let posB = this.raw.nthIndexOf("\n", mkbRow+1)

        const STYLE_A = "<span class='waiter_p2_highlight_tgt'>"
        const STYLE_B = "</span>"

        let output =
            this.raw.substring(0, indicies[0]) +
            STYLE_A + this.raw.substring(posA, posB) +
            STYLE_B + this.raw.substring(posB)

        return output
    }

    public displaySimple(): string {
        return this.raw;
    }
}