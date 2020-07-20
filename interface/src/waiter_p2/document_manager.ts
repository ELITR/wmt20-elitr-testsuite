import { DocumentLoader, UserIntroSync, UserProgress } from './document_loader';
import { DocTgt, DocSrc } from '../misc/document';

export type DocTgtArray = Array<[string, DocTgt]>
export type DocSrcArray = Array<[string, DocSrc]>

export class DocumentManager {
    public data!: UserIntroSync
    public constructor() { }

    public async load(AID: string): Promise<UserProgress> {
        let progress: UserProgress
        [this.data, progress] = await DocumentLoader.load(AID)
        return progress
    }

    public getAllMT(docName: string): DocTgtArray {
        return this.data.names_mt.map((value: string, index: number) => [value, this.data.content_mt.get(docName)!.get(value)!])
    }
}