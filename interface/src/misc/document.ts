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

        output = TextUtils.context(output, Math.round((indicies[0] + indicies[1]) / 2), DocSrc.MIN_CHAR_CONTEXT, DocSrc.SENT_CONTEXT)

        return output
    }

    public displayAll(markable: string): string {
        let output = this.raw
        const STYLE_A = "<span class='waiter_p1_highlight_src'>"
        const STYLE_B = "</span>"
        const STYLE_LEN = STYLE_A.length + STYLE_B.length

        this.markables.get(markable).forEach((indicies: [number, number], indiciesI: number) => {
            // This assumes, that the indicies are linearly ordered 
            let offset = STYLE_LEN * indiciesI
            output = output.slice(0, indicies[0] + offset) + STYLE_A + output.slice(indicies[0] + offset, indicies[1] + offset) + STYLE_B + output.slice(indicies[1] + offset)
        })

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
    private static UNDERLINE_CHAR_CONTEXT: number = 20
    private static SENT_CONTEXT: number = 1

    constructor(public raw: string) { }

    public display(doc_src: DocSrc, markable: string, index: number): string {
        let indicies: [number, number] = doc_src.get_sections(markable)[index]
        let position = Math.round((indicies[0] + indicies[1]) / 2)

        // very naive segment alignment
        let projection_position = position / doc_src.raw.length * this.raw.length

        const STYLE_A = "<span class='waiter_p2_highlight_tgt'>"
        const STYLE_B = "</span>"

        let output =
            this.raw.substring(0, projection_position - DocTgt.UNDERLINE_CHAR_CONTEXT) +
            STYLE_A + this.raw.substring(projection_position - DocTgt.UNDERLINE_CHAR_CONTEXT, projection_position + DocTgt.UNDERLINE_CHAR_CONTEXT) +
            STYLE_B + this.raw.substring(projection_position + DocTgt.UNDERLINE_CHAR_CONTEXT)

        output = TextUtils.context(output, projection_position, DocTgt.MIN_CHAR_CONTEXT, DocTgt.SENT_CONTEXT)
        return output
    }

    public displayAll(doc_src: DocSrc, markable: string): string {
        let output = this.raw
        const STYLE_A = "<span class='waiter_p1_highlight_tgt'>"
        const STYLE_B = "</span>"
        const STYLE_LEN = STYLE_A.length + STYLE_B.length

        doc_src.get_sections(markable).forEach((indicies: [number, number], indiciesI: number) => {
            // This assumes, that the indicies are linearly ordered 
            let offset = STYLE_LEN * indiciesI
            
            // very naive segment alignment
            let position = Math.round((indicies[0] + indicies[1]) / 2 + offset)
            let projection_position = position / doc_src.raw.length * this.raw.length

            output =
                output.substring(0, projection_position - DocTgt.UNDERLINE_CHAR_CONTEXT) +
                STYLE_A + output.substring(projection_position - DocTgt.UNDERLINE_CHAR_CONTEXT, projection_position + DocTgt.UNDERLINE_CHAR_CONTEXT) +
                STYLE_B + output.substring(projection_position + DocTgt.UNDERLINE_CHAR_CONTEXT)
        })

        return output
    }

    public displaySimple(): string {
        return this.raw;
    }
}