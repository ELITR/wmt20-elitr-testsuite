import { DocumentLoader } from './document_loader';
import { DocTgt, DocSrc } from './document';


export type DocTgtArray = Array<[string, DocTgt]>
export type DocSrcArray = Array<[string, DocSrc]>

export class DocumentManager {
    public documents: DocTgtArray
    public documents_src: DocSrcArray
    public constructor() { }

    public async load() {
        [this.documents, this.documents_src] = await DocumentLoader.load()
        this.assertSameLength()
    }

    public getAllMT(file: string): DocTgtArray {
        return Array.from(this.documents).filter(([key, doc], index, array) => key.startsWith(file + '_'))
    }

    public assertSameLength() {
        console.warn('assertSameLength not implemented')
    }
}