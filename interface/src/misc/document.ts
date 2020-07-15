import { TextUtils } from "./text_utils"

export class DocSrc {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public markable_keys: Array<string>
    private static MIN_CHAR_CONTEXT: number = 10000
    private static SENT_CONTEXT: number = 2

    constructor(public raw: string, markables: Map<string, Array<[number, number]>> = new Map()) {
        this.markables = markables
    }

    public display(markable: string, index: number): string {
        let output = this.raw
        let indicies = this.markables.get(markable)[index]

        const STYLE_A = "<span class='waiter_p2_highlight_src'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])

        let [posA, posB] = TextUtils.contextSentence(output, Math.round((indicies[0] + indicies[1]) / 2), DocSrc.MIN_CHAR_CONTEXT, DocSrc.SENT_CONTEXT)

        output = output.substring(posA, posB)

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
    private static MIN_CHAR_CONTEXT: number = 150
    private static SENT_CONTEXT: number = 1
    private static UNDERLINE_CHAR_CONTEXT: number = 10
    private static UNDERLINE_WORD_CONTEXT: number = 2

    constructor(public raw: string) { }

    public display(doc_src: DocSrc, markable: string, index: number): string {
        let indicies: [number, number] = doc_src.get_sections(markable)[index]
        let position = Math.round((indicies[0] + indicies[1]) / 2)

        // very naive segment alignment
        let projection_position = position / doc_src.raw.length * this.raw.length

        const STYLE_A = "<span class='waiter_p2_highlight_tgt'>"
        const STYLE_B = "</span>"

        let [posA, posB] = TextUtils.contextWord(this.raw, projection_position, DocTgt.UNDERLINE_CHAR_CONTEXT, DocTgt.UNDERLINE_WORD_CONTEXT)

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