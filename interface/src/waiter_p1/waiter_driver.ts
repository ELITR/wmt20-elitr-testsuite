import { DocumentManager } from "./document_manager"
import { DocSrc, DocTgt } from "../misc/document"
import { UserProgress } from "./document_loader"

export class WaiterDriver {

    public constructor(
        private manager: DocumentManager,
        public progress: UserProgress
    ) { }

    public current_docName(): string {
        return this.manager.data.queue_doc[this.progress.doc]
    }

    public currentDoc(): DocSrc {
        return this.manager.data.content_src.get(this.manager.data.queue_doc[this.progress.doc])!
    }

    public current_mts(): Array<string> {
        return this.manager.data.queue_mt.get(this.current_docName())!
    }

    public end_doc() {
        return this.progress.doc >= this.manager.data.queue_doc.length - 1
    }

    public end_sent() {
        return this.progress.sent >= this.currentDoc().lines - 1
    }
}