import { DocumentLoader, UserIntroSync } from './document_loader';
import { DocTgt, DocSrc } from './document';

export type DocTgtArray = Array<[string, DocTgt]>
export type DocSrcArray = Array<[string, DocSrc]>

export class DocumentManager {
    public data: UserIntroSync
    public constructor() { }

    public async load(AID: string) {
        this.data = await DocumentLoader.load(AID)
        this.assertSameLength()
    }

    public getAllMT(file: string): DocTgtArray {
        return this.data.mts.map((value: string, index: number) => [value, this.data.content_mt.get(file).get(value)])
    }

    public assertSameLength() {
        console.warn('assertSameLength not implemented')
    }
}