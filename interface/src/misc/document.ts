export class DocSrc {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public lines: number

    constructor(public raw: string, markables: Map<string, Array<[number, number]>> = new Map()) {
        this.markables = markables
        this.lines = raw.linesCount()
    }

    public display(markable: string, index: number): string {
        let output = this.raw
        let indicies = this.markables.get(markable)[index]

        const STYLE_A = "<span class='waiter_highlight_markable'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])

        return output
    }

    public displaySimple(): string {
        return this.raw
    }

    public displayLine(line: number): string {
        let posA = this.raw.nthIndexOf("\n", line)
        let posB = this.raw.nthIndexOf("\n", line + 1)

        const STYLE_A = "<span class='waiter_highlight_line'>"
        const STYLE_B = "</span>"

        let output =
            this.raw.substring(0, posA) +
            STYLE_A + this.raw.substring(posA, posB) +
            STYLE_B + this.raw.substring(posB)

        return output
    }

    public sections(markable: string): Array<[number, number]> {
        return this.markables.get(markable)
    }
}

export class DocTgt {
    constructor(public raw: string) { }

    public display(doc_src: DocSrc, markable: string, index: number): string {
        let indicies: [number, number] = doc_src.sections(markable)[index]
        let mkbRow = doc_src.raw.substr(0, indicies[0]).linesCount()
        return this.displayLine(mkbRow)
    }

    public displayLine(line: number) {
        let posA = this.raw.nthIndexOf("\n", line)
        let posB = this.raw.nthIndexOf("\n", line + 1)

        const STYLE_A = "<span class='waiter_highlight_line'>"
        const STYLE_B = "</span>"

        let output =
            this.raw.substring(0, posA) +
            STYLE_A + this.raw.substring(posA, posB) +
            STYLE_B + this.raw.substring(posB)

        return output
    }

    public displaySimple(): string {
        return this.raw;
    }
}