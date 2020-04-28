import { DocumentManager, AnnotationDocument, DocumentArray } from "./document_manager"
import * as $ from 'jquery'
import { FILES, MTS } from "./document_loader"
import { WaiterDisplayer } from "./waiter_displayer"

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_frame')
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
        })
    }

    public display_current() {
        this.display(FILES[this.currentDoc], this.currentMarkable, this.currentSection)
    }

    private display(file: string, markable: number, index: number) {
        let snippets: Array<[string, string]> = this.manager.getAllMT(file).map(([key, doc]) => [key, doc.display(markable, index)])
        let content = WaiterDisplayer.generateElements(snippets)
        this.waiter_tgt_table.html(content)
    }

    private current_sig(): string {
        return FILES[this.currentDoc]
    }

    private current_docs(): DocumentArray {
        return this.manager.documents.filter(([key, doc], index, arr) => key.startsWith(this.current_sig()))
    }

    private example_doc() : AnnotationDocument {
        // This should only work because I was promised there would be the same layout of markables in every doc given a single source
        return this.current_docs()[0][1]
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
        const markable_keys = this.example_doc().markable_keys
        if (this.currentMarkable + offset < 0 || this.currentMarkable + offset >= markable_keys.length) {
            throw Error('Markable index out of bounds')
        }
        this.currentMarkable += offset
        this.reset_sec()
        this.display_current()
        this.update_stats()
    }

    private move_sec(offset: number) {
        const sections = this.example_doc().get_sections(this.currentMarkable)
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
        let currentMarkables = this.example_doc().markable_keys
        let currentSections = this.example_doc().get_sections(this.currentMarkable)
        $('#totl_doc').text(`${this.currentDoc + 1}/${FILES.length}`)
        $('#totl_mkb').text(`${this.currentMarkable + 1}/${currentMarkables.length}`)
        $('#totl_sec').text(`${this.currentSection + 1}/${currentSections.length}`)
    }
}