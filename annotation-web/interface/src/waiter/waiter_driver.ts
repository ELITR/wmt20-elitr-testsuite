import { DocumentManager } from "../documents/document_manager"
import { DocSrc } from "../documents/document"

export class WaiterDriver {
    
    public currentDoc: number
    public currentMarkable: number
    public currentSection: number

    public constructor(private manager: DocumentManager) {
        // TODO
        this.currentDoc = 0
        this.currentMarkable = 0
        this.currentSection = 0
    }

    public current_sig(): string {
        return this.manager.data.queue_doc[this.currentDoc]
    }

    public current_doc_src(): DocSrc {
        return this.manager.data.content_src.get(this.manager.data.queue_doc[this.currentDoc])
    }

    public current_sections(): Array<[number, number]> {
        return this.current_doc_src().get_sections(this.currentMarkable)
    }

    public move_doc(offset: number) {
        if (this.currentDoc + offset < 0 || this.currentDoc + offset >= this.manager.data.queue_doc.length) {
            throw Error('Document index out of bounds')
        }
        this.currentDoc += offset
        this.reset_mkb()
        this.reset_sec()
    }

    public move_mkb(offset: number) {
        const markable_keys = this.current_doc_src().markable_keys
        if (this.currentMarkable + offset < 0 || this.currentMarkable + offset >= markable_keys.length) {
            throw Error('Markable index out of bounds')
        }
        this.currentMarkable += offset
        this.reset_sec()
    }

    public move_sec(offset: number) {
        const sections = this.current_sections()
        if (this.currentSection + offset < 0 || this.currentSection + offset >= sections.length) {
            throw Error('Section index out of bounds')
        }
        this.currentSection += offset
    }

    public reset_sec() {
        this.currentSection = 0
    }

    public reset_mkb() {
        this.currentMarkable = 0
    }    
}