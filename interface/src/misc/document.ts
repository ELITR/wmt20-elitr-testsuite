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
    private static MIN_WORD_COUNT = 1

    public displayMarkable(doc_src: DocSrc, markable: string, index: number): string {
        let lineSectionIndex: { [key: number]: Array<[number, number]> } = {}
        let lineHighlightIndex: number
        let lineHighlightIndexCount: number = 0

        doc_src.sections(markable).forEach((indicies, indiciesIndex) => {
            let mkbLine = doc_src.raw.substr(0, indicies[0]).linesCount()
            if (lineSectionIndex[mkbLine] != undefined) {
                lineSectionIndex[mkbLine].push(indicies)
            } else {
                lineSectionIndex[mkbLine] = [indicies]
            }
            if (index == indiciesIndex) {
                lineHighlightIndex = mkbLine
                lineHighlightIndexCount = lineSectionIndex[mkbLine].length
            }
        })

        // Assert ordering and non-overlaping
        Object.keys(lineSectionIndex).map(Number).forEach((key, index, value) => {
            // sort by the first key
            lineSectionIndex[key] = lineSectionIndex[key].sort(([a1, a2]: [number, number], [b1, b2]: [number, number]) => a1 - b1)

            // assert they do not overlap
            lineSectionIndex[key].forEach(([a1, a2]: [number, number], index: number) => {
                if (index == 0)
                    return
                if (a2 < lineSectionIndex[key][index - 1][1])
                    throw new Error('Sorted markable indicies overlap')
            })
        })

        let srcLines = doc_src.raw.split('\n')
        let tgtLines = this.raw.split('\n')
        let output: Array<string> = []
        let lineSum = 0

        tgtLines.forEach((tgtLine: string, curLineIndex: number) => {
            let srcLine = srcLines[curLineIndex]
            if (lineSectionIndex[curLineIndex] != undefined) {
                let lineOffset = 0
                let tmpLine = tgtLine
                let newOffset: number

                for (let indicies of lineSectionIndex[curLineIndex]) {
                    let posA = indicies[0] - lineSum
                    let posB = indicies[1] - lineSum

                    if (curLineIndex == lineHighlightIndex) {
                        lineHighlightIndexCount -= 1;
                        if (lineHighlightIndexCount == 0) {
                            [tmpLine, newOffset] = this.displayMarkableLineFull([posA, posB], lineOffset, srcLine, tmpLine)
                        } else {
                            [tmpLine, newOffset] = this.displayMarkableLineEmpty([posA, posB], lineOffset, srcLine, tmpLine)
                        }
                    } else {
                        [tmpLine, newOffset] = this.displayMarkableLineEmpty([posA, posB], lineOffset, srcLine, tmpLine)
                    }
                    lineOffset += newOffset
                }

                if (curLineIndex == lineHighlightIndex) {
                    output.push(this.wrapLine(tmpLine)[0])
                } else {
                    output.push(tmpLine)
                }

            } else {
                output.push(tgtLine)
            }
            lineSum += srcLine.length + 1
        })

        return output.join('\n')
    }


    public displayMarkableLineEmpty(indicies: [number, number], lineOffset: number, srcLine: string, tgtLine: string): [string, number] {
        let line = tgtLine.toString()

        let srcLineLength = srcLine.length
        let tgtLineLength = tgtLine.length
        let avgIndicies = (indicies[0] + indicies[1]) / 2 * 0.88
        let alignment = Math.round(avgIndicies * tgtLineLength / srcLineLength) + lineOffset

        const MKB_STYLE_A = "<span class='waiter_highlight_markable_tgt_alone'>"
        const MKB_STYLE_B = "</span>"

        let [mkbPosA, mkbPosB] = TextUtils.contextWord(line, alignment, DocTgt.MIN_CHAR_CONTEXT, DocTgt.MIN_WORD_COUNT)

        line =
            line.slice(0, mkbPosA) +
            MKB_STYLE_A + line.slice(mkbPosA, mkbPosB) + MKB_STYLE_B +
            line.slice(mkbPosB)

        let offset =
            MKB_STYLE_A.length + MKB_STYLE_B.length

        return [line, offset]
    }

    public displayMarkableLineFull(indicies: [number, number], lineOffset: number, srcLine: string, tgtLine: string): [string, number] {
        let line = tgtLine.toString()

        let srcLineLength = srcLine.length
        let tgtLineLength = tgtLine.length
        let avgIndicies = (indicies[0] + indicies[1]) / 2 * 0.88
        let alignment = Math.round(avgIndicies * tgtLineLength / srcLineLength) + lineOffset

        const MKB_STYLE_A = "<span class='waiter_highlight_markable_tgt'>"
        const MKB_STYLE_B = "</span>"

        let [mkbPosA, mkbPosB] = TextUtils.contextWord(line, alignment, DocTgt.MIN_CHAR_CONTEXT, DocTgt.MIN_WORD_COUNT)

        line =
            line.slice(0, mkbPosA) +
            MKB_STYLE_A + line.slice(mkbPosA, mkbPosB) + MKB_STYLE_B +
            line.slice(mkbPosB)

        let offset =
            MKB_STYLE_A.length + MKB_STYLE_B.length

        return [line, offset]
    }

    public wrapLine(line: string): [string, number] {
        const LINE_STYLE_A = "<span class='waiter_highlight_line'>"
        const LINE_STYLE_B = "</span>"
        let offset = LINE_STYLE_A.length + LINE_STYLE_B.length

        let output = LINE_STYLE_A + line + LINE_STYLE_B
        return [output, offset]
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