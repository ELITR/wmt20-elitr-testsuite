import { DocumentLoader, UserProgress, UserIntroSync } from './document_loader';
import { DocTgt, DocSrc } from '../documents/document';

export type DocTgtArray = Array<[string, DocTgt]>
export type DocSrcArray = Array<[string, DocSrc]>

export class DocumentManager {
    public data:  UserIntroSync
    public constructor() { }

    public async load(AID: string): Promise<UserProgress> {
        let progress: UserProgress
        [this.data, progress] = await DocumentLoader.load(AID)
        return progress
    }

    public getAllMT(file: string): DocTgtArray {
        return this.data.mts.map((value: string, index: number) => [value, this.data.content_mt.get(file).get(value)])
    }

    public currentMT(docName: string, mtName: string): DocTgt {
        return this.data.content_mt.get(docName).get(mtName)
    }

    public assertSameLength() {
        console.warn('assertSameLength not implemented')
    }
}