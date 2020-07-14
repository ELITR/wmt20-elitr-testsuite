import { DocumentManager } from "./document_manager"
import { DocSrc } from "../documents/document"
import { UserProgress } from "./document_loader"

export class WaiterDriver {

    public constructor(
        private manager: DocumentManager,
        public progress: UserProgress
    ) { }

    public current_docName(): string {
        return this.manager.data.queue_doc[this.progress.doc]
    }

    public current_doc(): DocSrc {
        return this.manager.data.content_src.get(this.manager.data.queue_doc[this.progress.doc])
    }

    public current_mts(): Array<string> {
        return this.manager.data.queue_mt[this.current_docName()]
    }

    public move_doc(offset: number) {
        if (this.progress.doc + offset < 0 || this.progress.doc + offset >= this.manager.data.queue_doc.length) {
            throw Error('Document index out of bounds')
        }
        this.progress.doc += offset
        this.progress.mt = 0
    }

    public move_mt(offset: number) {
        const mts = this.current_mts()
        if (this.progress.mt + offset < 0 || this.progress.mt + offset >= mts.length) {
            throw Error('MT model index out of bounds')
        }
        this.progress.mt += offset
    }

    public end_doc() {
        return this.progress.doc >= this.manager.data.queue_doc.length - 1
    }

    public end_mt() {
        const mts = this.current_mts()
        return this.progress.mt >= mts.length - 1
    }

    public progress_next(): UserProgress {
        let next: UserProgress = this.progress.clone()
        
        if (this.end_mt()) {
            next.mt = 0;
            if (this.end_doc()) {
                next.doc = next.mt = -1
            } else {
                next.doc += 1
            }
        } else {
            next.mt += 1
        }

        return next
    }
    
    public progress_prev(): UserProgress {
        let prev: UserProgress = this.progress.clone()

        if (prev.mt == 0) {
            if (prev.doc > 0) {
                prev.doc -= 1
                let prevDocName = this.manager.data.queue_doc[prev.doc]
                prev.mt = this.manager.data.queue_mt[prevDocName].length -1
            }
        } else {
            prev.mt -= 1
        }

        return prev
    }
}