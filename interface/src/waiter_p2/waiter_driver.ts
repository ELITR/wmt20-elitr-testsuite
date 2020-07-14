import { DocumentManager } from "./document_manager"
import { DocSrc } from "../documents/document"
import { UserProgress } from "./document_loader"

export class WaiterDriver {

    public constructor(
        private manager: DocumentManager,
        public progress: UserProgress
    ) { }

    public currentDocName(): string {
        return this.manager.data.queue_doc[this.progress.doc]
    }

    public currentDoc(): DocSrc {
        return this.manager.data.content_src.get(this.manager.data.queue_doc[this.progress.doc])
    }

    public currentMarkableName() : string {
        return this.manager.data.queue_mkb.get(this.currentDocName())[this.progress.mkb]
    }

    public currentSections(): Array<[number, number]> {
        return this.currentDoc().get_sections(this.currentMarkableName())
    }

    public move_doc(offset: number) {
        if (this.progress.doc + offset < 0 || this.progress.doc + offset >= this.manager.data.queue_doc.length) {
            throw Error('Document index out of bounds')
        }
        this.progress.doc += offset
        this.progress.mkb = 0
        this.progress.sec = 0
    }

    public move_mkb(offset: number) {
        const markable_keys = this.currentDoc().markable_keys
        if (this.progress.mkb + offset < 0 || this.progress.mkb + offset >= markable_keys.length) {
            throw Error('Markable index out of bounds')
        }
        this.progress.mkb += offset
        this.progress.sec = 0
    }

    public move_sec(offset: number) {
        const sections = this.currentSections()
        if (this.progress.sec + offset < 0 || this.progress.sec + offset >= sections.length) {
            throw Error('Section index out of bounds')
        }
        this.progress.sec += offset
    }

    public end_doc() {
        return this.progress.doc >= this.manager.data.queue_doc.length - 1
    }

    public end_mkb() {
        const markable_keys = this.currentDoc().markable_keys
        return this.progress.mkb >= markable_keys.length - 1
    }

    public end_sec() {
        const sections = this.currentSections()
        return this.progress.sec >= sections.length - 1
    }
}