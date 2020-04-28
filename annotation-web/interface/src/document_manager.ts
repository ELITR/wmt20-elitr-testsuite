import { DocumentLoader } from './document_loader';

export class AnnotationDocument {
    private markables: Map<string, Array<[number, number]>> = new Map<string, Array<[number, number]>>()
    public markable_keys: Array<string>
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

    public display(markable: number, index: number): [string, number] {
        let output = this.raw
        let indicies = this.markables.get(this.markable_keys[markable])[index]
        const STYLE_A = "<span class='waiter_highlight'>"
        const STYLE_B = "</span>"
        output = output.slice(0, indicies[0]) + STYLE_A + output.slice(indicies[0], indicies[1]) + STYLE_B + output.slice(indicies[1])
        return [output, indicies[0]]
    }

    public get_sections(markable: number): Array<[number, number]> {
        return this.markables.get(this.markable_keys[markable])
    }
}

export type DocumentMap = Map<string, AnnotationDocument>
export class DocumentManager {
    public documents: DocumentMap
    public constructor() { }

    public async load() {
        this.documents = await DocumentLoader.load()
        this.assertSameLength()
    }

    public assertSameLength() {
        console.warn('assertSameLength not implemented')
    }
}