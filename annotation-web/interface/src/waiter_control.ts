import { DocumentManager, DocSrcArray, DocTgtArray } from "./documents/document_manager"
import * as $ from 'jquery'
import { FILES, MTS } from "./documents/document_loader"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "./misc/page_utils"
import { DocSrc, DocTgt } from "./documents/document"

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_frame')
    private waiter_src_snip: JQuery<HTMLDivElement> = $('#src_snip')
    private waiter_tgt_table: JQuery<HTMLDivElement> = $('#waiter_tgt_table')

    private manager: DocumentManager

    private currentDoc: number
    private currentMarkable: number

    private currentSection: number

    public constructor(private AID: string) {
        this.waiter_frame.show()

        // TODO
        this.currentDoc = 0
        this.currentMarkable = 0
        this.currentSection = 0

        $('#next_doc').click(() => this.move_doc(+1))
        $('#prev_doc').click(() => this.move_doc(-1))
        $('#next_mkb').click(() => this.move_mkb(+1))
        $('#prev_mkb').click(() => this.move_mkb(-1))
        $('#next_sec').click(() => this.move_sec(+1))
        $('#prev_sec').click(() => this.move_sec(-1))

        this.manager = new DocumentManager()
        new Promise(async () => {
            await this.manager.load()
            this.update_stats()
            this.display_current()
            this.update_buttons()
        })

    }

    public display_current() {
        this.display(FILES[this.currentDoc], this.currentMarkable, this.currentSection)
    }

    private display(file: string, markable: number, index: number) {
        let current_src = this.current_doc_src()
        this.waiter_src_snip.html(current_src.display(markable, index))

        let snippets: Array<[string, string]> = this.manager.getAllMT(file).map(
            ([key, doc]) => [key, doc.display(current_src, markable, index)]
        )

        let content = WaiterDisplayer.generateElements(snippets)
        this.waiter_tgt_table.html(content)
        
        PageUtils.syncval()
    }

    private current_sig(): string {
        return FILES[this.currentDoc]
    }

    private current_docs(): DocTgtArray {
        return this.manager.documents.filter(([key, doc], index, arr) => key.startsWith(this.current_sig()))
    }

    private current_doc_src(): DocSrc {
        return this.manager.documents_src.filter(([key, doc], index, arr) => key == FILES[this.currentDoc])[0][1]
    }

    private move_doc(offset: number) {
        if (this.currentDoc + offset < 0 || this.currentDoc + offset >= FILES.length) {
            throw Error('Document index out of bounds')
        }
        this.currentDoc += offset
        this.reset_mkb()
        this.reset_sec()
        this.display_current()
        this.update_stats()
    }

    private move_mkb(offset: number) {
        const markable_keys = this.current_doc_src().markable_keys
        if (this.currentMarkable + offset < 0 || this.currentMarkable + offset >= markable_keys.length) {
            throw Error('Markable index out of bounds')
        }
        this.currentMarkable += offset
        this.reset_sec()
        this.display_current()
        this.update_stats()
    }

    private move_sec(offset: number) {
        const sections = this.current_doc_src().get_sections(this.currentMarkable)
        if (this.currentSection + offset < 0 || this.currentSection + offset >= sections.length) {
            throw Error('Section index out of bounds')
        }
        this.currentSection += offset
        this.display_current()
        this.update_stats()
    }

    private reset_sec() {
        this.currentSection = 0
    }

    private reset_mkb() {
        this.currentMarkable = 0
    }

    private update_stats() {
        let currentMarkables = this.current_doc_src().markable_keys
        let currentSections = this.current_doc_src().get_sections(this.currentMarkable)
        $('#totl_doc').text(`${this.currentDoc + 1}/${FILES.length}`)
        $('#totl_mkb').text(`${this.currentMarkable + 1}/${currentMarkables.length}`)
        $('#totl_sec').text(`${this.currentSection + 1}/${currentSections.length}`)
        this.update_buttons()
    }

    private update_buttons() {
        $('#next_doc').prop('disabled', this.currentDoc >= FILES.length - 1)
        $('#prev_doc').prop('disabled', this.currentDoc <= 0)

        const markable_keys = this.current_doc_src().markable_keys
        $('#next_mkb').prop('disabled', this.currentMarkable >= markable_keys.length - 1)
        $('#prev_mkb').prop('disabled', this.currentMarkable <= 0)

        const sections = this.current_doc_src().get_sections(this.currentMarkable)
        $('#next_sec').prop('disabled', this.currentSection >= sections.length - 1)
        $('#prev_sec').prop('disabled', this.currentSection <= 0)
    }
}