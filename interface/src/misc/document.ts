export class DocSrc {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public lines: number

    constructor(public raw: string, markables: Map<string, Array<[number, number]>> | undefined = undefined) {
        if (markables != undefined) {
            if(markables!.size == 0) {
                throw new Error('Zero number of markables is not allowed. (' + raw.substr(0, 100) + ')')
            } else {
                this.markables = markables
            }
        }
        this.lines = raw.linesCount()
    }

    public display(markable: string, index: number): string {
        let indicies = this.markables.get(markable)![index]
        let mkbRow = this.raw.substr(0, indicies[0]).linesCount()
        let output = this.raw
        
        const STYLE_A = "<span class='waiter_highlight_markable'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])
        output = this.displayLine(mkbRow, output)

        return output
    }

    public displaySimple(): string {
        return this.raw
    }

    public displayLine(line: number, raw: string = this.raw): string {
        let posA = raw.nthIndexOf("\n", line)
        let posB = raw.nthIndexOf("\n", line + 1)

        const STYLE_A = "<span class='waiter_highlight_line'>"
        const STYLE_B = "</span>"

        let output =
            raw.substring(0, posA) +
            STYLE_A + raw.substring(posA, posB) +
            STYLE_B + raw.substring(posB)

        return output
    }

    public sections(markable: string): Array<[number, number]> {
        return this.markables.get(markable)!
    }
}

export class DocTgt {
    constructor(public raw: string) { }

    public displayMarkable(doc_src: DocSrc, markable: string, index: number): string {
        let indicies: [number, number] = doc_src.sections(markable)[index]
        let mkbRow = doc_src.raw.substr(0, indicies[0]).linesCount()
        return this.displayLine(mkbRow)
    }

    public displayLine(line: number, raw: string = this.raw) {
        let posA = raw.nthIndexOf("\n", line)
        let posB = raw.nthIndexOf("\n", line + 1)

        const STYLE_A = "<span class='waiter_highlight_line'>"
        const STYLE_B = "</span>"

        let output =
            raw.substring(0, posA) +
            STYLE_A + raw.substring(posA, posB) +
            STYLE_B + raw.substring(posB)

        return output
    }

    public displaySimple(): string {
        return this.raw;
    }
}