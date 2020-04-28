import { DocumentLoader } from './document_loader';

export class AnnotationDocument {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public markable_keys: Array<string>
    private static CONTEXT_SIZE: number = 150
    private raw: string

    constructor(raw: string) {
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
            console.log(markableClass, markableContent, indexA, indexB)

            if (this.markables.has(markableClass)) {
                this.markables.get(markableClass).push([indexA, indexB])
            } else {
                this.markables.set(markableClass, [[indexA, indexB]])
            }
        }

        this.raw = raw
        this.markable_keys = Array.from(this.markables.keys()).sort()
    }

    public display(markable: number, index: number): string {
        let output = this.raw
        let indicies = this.markables.get(this.markable_keys[markable])[index]
        const STYLE_A = "<span class='waiter_highlight'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])

        let position = indicies[0]

        // left context align to neares non-space
        let offset_a = 0
        if (position - AnnotationDocument.CONTEXT_SIZE > 0) {
            for (; offset_a < AnnotationDocument.CONTEXT_SIZE; offset_a++) {
                if (output[position - AnnotationDocument.CONTEXT_SIZE + offset_a].match(/\s/)) {
                    break
                }
            }
            if (offset_a == AnnotationDocument.CONTEXT_SIZE) {
                throw new Error('Could not create reasonable left context')
            }
        }

        // right context align to neares non-space
        let offset_b = 0
        if (position + AnnotationDocument.CONTEXT_SIZE < output.length) {
            for (; offset_b < AnnotationDocument.CONTEXT_SIZE; offset_b++) {
                if (output[position + AnnotationDocument.CONTEXT_SIZE - offset_b].match(/\s/)) {
                    break
                }
            }
            if (offset_b == AnnotationDocument.CONTEXT_SIZE) {
                throw new Error('Could not create reasonable right context')
            }
        }

        output = output.substr(Math.max(0, position - AnnotationDocument.CONTEXT_SIZE + offset_a), 2 * AnnotationDocument.CONTEXT_SIZE - offset_b)

        return output
    }

    public get_sections(markable: number): Array<[number, number]> {
        return this.markables.get(this.markable_keys[markable])
    }
}

export type DocumentArray = Array<[string, AnnotationDocument]>
export class DocumentManager {
    public documents: DocumentArray
    public constructor() { }

    public async load() {
        this.documents = await DocumentLoader.load()
        this.assertSameLength()
    }

    public getAllMT(file: string): DocumentArray {
        return Array.from(this.documents).filter(([key, doc], index, array) => key.startsWith(file + '_'))
    }

    public assertSameLength() {
        console.warn('assertSameLength not implemented')
    }
}