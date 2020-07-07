import { DocumentLoader, UserIntroSync, UserProgressP2, UserProgressP1 } from './document_loader';
import { DocTgt, DocSrc } from './document';

export type DocTgtArray = Array<[string, DocTgt]>
export type DocSrcArray = Array<[string, DocSrc]>

export class DocumentManager {
    public data: UserIntroSync
    public constructor() { }

    public async loadP2(AID: string): Promise<UserProgressP2> {
        let progress: UserProgressP2
        [this.data, progress] = await DocumentLoader.loadP2(AID)
        this.assertSameLength()
        return progress
    }

    public async loadP1(AID: string): Promise<UserProgressP1> {
        let progress: UserProgressP1
        [this.data, progress] = await DocumentLoader.loadP1(AID)
        this.assertSameLength()
        return progress
    }

    public getAllMT(file: string): DocTgtArray {
        return this.data.mts.map((value: string, index: number) => [value, this.data.content_mt.get(file).get(value)])
    }

    public assertSameLength() {
        console.warn('assertSameLength not implemented')
    }
}