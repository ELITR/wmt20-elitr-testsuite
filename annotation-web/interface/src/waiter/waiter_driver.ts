import { DocumentManager } from "../documents/document_manager"
import { DocSrc } from "../documents/document"
import { UserProgress } from "../documents/document_loader"

export class WaiterDriver {

    public constructor(
        private manager: DocumentManager,
        public progress: UserProgress
    ) { }

    public current_sig(): string {
        return this.manager.data.queue_doc[this.progress.doc]
    }

    public current_doc_src(): DocSrc {
        return this.manager.data.content_src.get(this.manager.data.queue_doc[this.progress.doc])
    }

    public current_sections(): Array<[number, number]> {
        return this.current_doc_src().get_sections(this.progress.mkb)
    }

    public move_doc(offset: number) {
        if (this.progress.doc + offset < 0 || this.progress.doc + offset >= this.manager.data.queue_doc.length) {
            throw Error('Document index out of bounds')
        }
        this.progress.doc += offset
        this.reset_mkb()
        this.reset_sec()
    }

    public move_mkb(offset: number) {
        const markable_keys = this.current_doc_src().markable_keys
        if (this.progress.mkb + offset < 0 || this.progress.mkb + offset >= markable_keys.length) {
            throw Error('Markable index out of bounds')
        }
        this.progress.mkb += offset
        this.reset_sec()
    }

    public move_sec(offset: number) {
        const sections = this.current_sections()
        if (this.progress.sec + offset < 0 || this.progress.sec + offset >= sections.length) {
            throw Error('Section index out of bounds')
        }
        this.progress.sec += offset
    }

    public end_doc() {
        return this.progress.doc >= this.manager.data.queue_doc.length - 1
    }

    public end_mkb() {
        const markable_keys = this.current_doc_src().markable_keys
        return this.progress.mkb >= markable_keys.length - 1
    }

    public end_sec() {
        const sections = this.current_sections()
        return this.progress.sec >= sections.length - 1
    }

    public reset_sec() {
        this.progress.sec = 0
    }

    public reset_mkb() {
        this.progress.mkb = 0
    }

    public log_progress() {
        console.log(this.progress.doc, this.progress.mkb, this.progress.sec)
    }

    public advanced(): UserProgress {
        let next: UserProgress = {...this.progress}

        if (this.end_sec()) {
            this.reset_sec()
            if (this.end_mkb()) {
                this.reset_mkb()
                if (this.end_doc()) {
                    next.doc = next.mkb = next.sec = -1
                } else {
                    next.doc += 1
                }
            } else {
                next.mkb += 1
            }
        } else {
            next.sec += 1
        }

        return next
    }
}