import { DocumentManager } from "./document_manager"
import { DocSrc } from "../documents/document"
import { UserProgress } from "./document_loader"

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

    public current_mts(): Array<string> {
        return this.manager.data.queue_mts[this.current_sig()]
    }

    public move_doc(offset: number) {
        if (this.progress.doc + offset < 0 || this.progress.doc + offset >= this.manager.data.queue_doc.length) {
            throw Error('Document index out of bounds')
        }
        this.progress.doc += offset
        this.reset_mtn()
    }

    public move_mtn(offset: number) {
        const mts = this.current_mts()
        if (this.progress.mtn + offset < 0 || this.progress.mtn + offset >= mts.length) {
            throw Error('MT model index out of bounds')
        }
        this.progress.mtn += offset
    }

    public end_doc() {
        return this.progress.doc >= this.manager.data.queue_doc.length - 1
    }

    public end_mtn() {
        const mts = this.current_mts()
        return this.progress.mtn >= mts.length - 1
    }

    public reset_mtn() {
        this.progress.mtn = 0
    }

    public log_progress() {
        console.log(this.progress.doc, this.progress.mtn)
    }

    public advanced(): UserProgress {
        let next: UserProgress = new UserProgress(this.progress.doc, this.progress.mtn)

        if (this.end_mtn()) {
            next.mtn = 0;
            if (this.end_doc()) {
                next.doc = next.mtn = -1
            } else {
                next.doc += 1
            }
        } else {
            next.mtn += 1
        }

        return next
    }
}