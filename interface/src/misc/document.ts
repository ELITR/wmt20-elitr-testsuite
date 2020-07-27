import { TextUtils } from "./text_utils"

export class DocSrc {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public lines: number

    constructor(public raw: string, markables: Map<string, Array<[number, number]>> | undefined = undefined) {
        if (markables != undefined) {
            if (markables!.size == 0) {
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
    private static MIN_CHAR_CONTEXT = 10
    private static MAX_WORD_COUNT = 2

    public displayMarkable(doc_src: DocSrc, markable: string, index: number): string {
        let lineSectionIndex: { [key: number]: [number, number] } = {}
        let lineHighlightIndex: number

        doc_src.sections(markable).forEach((indicies, indiciesIndex) => {
            let mkbLine = doc_src.raw.substr(0, indicies[0]).linesCount()
            if (index == indiciesIndex) {
                lineHighlightIndex = mkbLine
            }
            if (lineSectionIndex[mkbLine] != undefined) {
                lineSectionIndex[mkbLine] = indicies
                // throw new Error("Two markables on one line")
            } else {
                lineSectionIndex[mkbLine] = indicies
            }
        })

        let srcLines = doc_src.raw.split('\n')
        let tgtLines = this.raw.split('\n')
        let output: Array<string> = []
        let offset = 0
        let lineSum = 0

        tgtLines.forEach((tgtLine: string, curLineIndex: number) => {
            let srcLine = srcLines[curLineIndex]
            let [newLine, newOffset] = ['', 0]
            if (lineSectionIndex[curLineIndex] != undefined) {
                let indicies = lineSectionIndex[curLineIndex]
                let posA = indicies[0] - lineSum
                let posB = indicies[1] - lineSum
                if (curLineIndex == lineHighlightIndex) {
                    [newLine, newOffset] = this.displayMarkableLineFull([posA, posB], srcLine, tgtLine)
                } else {
                    [newLine, newOffset] = this.displayMarkableLineEmpty([posA, posB], srcLine, tgtLine)
                }
            } else {
                newLine = tgtLine
            }
            output.push(newLine)
            offset += newOffset
            lineSum += srcLine.length + 1
        })

        return output.join('\n')
    }


    public displayMarkableLineEmpty(indicies: [number, number], srcLine: string, tgtLine: string): [string, number] {
        let line = tgtLine.toString()

        let srcLineLength = srcLine.length
        let tgtLineLength = tgtLine.length
        let avgIndicies = (indicies[0] + indicies[1]) / 2
        let alignment = Math.round(avgIndicies * tgtLineLength / srcLineLength)

        const MKB_STYLE_A = "<span class='waiter_highlight_markable_tgt_alone'>"
        const MKB_STYLE_B = "</span>"

        let [mkbPosA, mkbPosB] = TextUtils.contextWord(line, alignment, DocTgt.MIN_CHAR_CONTEXT, DocTgt.MAX_WORD_COUNT)

        line =
            line.slice(0, mkbPosA) +
            MKB_STYLE_A + line.slice(mkbPosA, mkbPosB) + MKB_STYLE_B +
            line.slice(mkbPosB)

        let offset =
            MKB_STYLE_A.length + MKB_STYLE_B.length

        return [line, offset]
    }

    public displayMarkableLineFull(indicies: [number, number], srcLine: string, tgtLine: string): [string, number] {
        let line = tgtLine.toString()

        let srcLineLength = srcLine.length
        let tgtLineLength = tgtLine.length
        let avgIndicies = (indicies[0] + indicies[1]) / 2
        let alignment = Math.round(avgIndicies * tgtLineLength / srcLineLength)

        const MKB_STYLE_A = "<span class='waiter_highlight_markable_tgt'>"
        const MKB_STYLE_B = "</span>"
        const LINE_STYLE_A = "<span class='waiter_highlight_line'>"
        const LINE_STYLE_B = "</span>"

        let [mkbPosA, mkbPosB] = TextUtils.contextWord(line, alignment, DocTgt.MIN_CHAR_CONTEXT, DocTgt.MAX_WORD_COUNT)

        line =
            LINE_STYLE_A + line.slice(0, mkbPosA) +
            MKB_STYLE_A + line.slice(mkbPosA, mkbPosB) + MKB_STYLE_B +
            line.slice(mkbPosB) + LINE_STYLE_B

        let offset =
            MKB_STYLE_A.length + MKB_STYLE_B.length +
            LINE_STYLE_A.length + LINE_STYLE_B.length

        return [line, offset]
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

    public displaySimple(): string {
        return this.raw;
    }
}