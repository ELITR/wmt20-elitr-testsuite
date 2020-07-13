import { TextUtils } from "../misc/text_utils"

export class DocSrc {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public markable_keys: Array<string>
    private static MIN_CHAR_CONTEXT: number = 150
    private static SENT_CONTEXT: number = 2

    constructor(public raw: string) {
        let offset = 0
        const MARKABLE_SEARCH = /<m m=["'](.*?)["']>(.*?)<\/m>/
        while (true) {
            let matches = raw.match(MARKABLE_SEARCH)
            if (!matches) {
                break
            }
            let markableClass = matches[1]
            let markableContent = matches[2]
            let indexA = raw.indexOf('<m', offset)
            let indexB = raw.indexOf('</m>', offset) - 6 - 2 - markableClass.length
            offset = indexB
            raw = raw.replace(MARKABLE_SEARCH, markableContent)

            if (this.markables.has(markableClass)) {
                this.markables.get(markableClass).push([indexA, indexB])
            } else {
                this.markables.set(markableClass, [[indexA, indexB]])
            }
        }

        this.markable_keys = Array.from(this.markables.keys()).sort()
        this.raw = raw
    }

    public display(markable: number, index: number): string {
        let output = this.raw
        let indicies = this.markables.get(this.markable_keys[markable])[index]
        const STYLE_A = "<span class='waiter_p2_highlight_src'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])

        output = TextUtils.context(output, Math.round((indicies[0] + indicies[1]) / 2), DocSrc.MIN_CHAR_CONTEXT, DocSrc.SENT_CONTEXT)

        return output
    }

    public displayAll(markable: number): string {
        let output = this.raw
        const STYLE_A = "<span class='waiter_p1_highlight_src'>"
        const STYLE_B = "</span>"
        const STYLE_LEN = STYLE_A.length + STYLE_B.length

        this.markables.get(this.markable_keys[markable]).forEach((indicies: [number, number], indiciesI: number) => {
            // This assumes, that the indicies are linearly ordered 
            let offset = STYLE_LEN * indiciesI
            output = output.slice(0, indicies[0] + offset) + STYLE_A + output.slice(indicies[0] + offset, indicies[1] + offset) + STYLE_B + output.slice(indicies[1] + offset)
        })

        return output
    }

    public displaySimple(): string {
        return this.raw;
    }

    public get_sections(markable: number): Array<[number, number]> {
        return this.markables.get(this.markable_keys[markable])
    }
}

export class DocTgt {
    private static MIN_CHAR_CONTEXT: number = 150
    private static UNDERLINE_CHAR_CONTEXT: number = 20
    private static SENT_CONTEXT: number = 1

    constructor(public raw: string) { }

    public display(doc_src: DocSrc, markable: number, index: number): string {
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

    public displayAll(doc_src: DocSrc, markable: number): string {
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