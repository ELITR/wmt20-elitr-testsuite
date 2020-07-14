import { DocumentManager } from "./document_manager"
import { DocSrc } from "../misc/document"
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

    public end_doc() {
        return this.progress.doc >= this.manager.data.queue_doc.length - 1
    }

    public end_mkb() {
        const currentMarkables = this.manager.data.queue_mkb.get(this.currentDocName())
        return this.progress.mkb >= currentMarkables.length - 1
    }

    public end_sec() {
        const sections = this.currentSections()
        return this.progress.sec >= sections.length - 1
    }
}