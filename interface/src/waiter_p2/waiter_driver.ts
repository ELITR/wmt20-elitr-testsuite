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

    public progress_next(): UserProgress {
        let next: UserProgress = this.progress.clone()

        if (this.end_sec()) {
            next.sec = 0;
            if (this.end_mkb()) {
                next.mkb = 0;
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


    public progress_prev(): UserProgress {
        let prev: UserProgress = this.progress.clone()

        if (prev.sec == 0) {
            if (prev.mkb == 0) {
                if (prev.doc > 0) {
                    prev.doc -= 1
                    let prevDocName = this.manager.data.queue_doc[prev.doc]
                    let prevDoc = this.manager.data.content_src.get(prevDocName)
                    prev.mkb = prevDoc.markable_keys.length - 1

                    let prevMarkableName = this.manager.data.queue_mkb.get(prevDocName)[prev.mkb]
                    prev.sec = prevDoc.get_sections(prevMarkableName).length - 1
                }
            } else {
                prev.mkb -= 1
                let prevDocName = this.manager.data.queue_doc[prev.doc]
                let prevDoc = this.manager.data.content_src.get(prevDocName)
                let prevMarkableName = this.manager.data.queue_mkb.get(prevDocName)[prev.mkb]
                prev.sec = prevDoc.get_sections(prevMarkableName).length - 1
            }
        } else {
            prev.sec -= 1
        }

        return prev
    }
}