import { DocumentManager } from "./document_manager"
import * as $ from 'jquery'
import { FILES as DOCS, MTS } from "./document_loader"

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_frame')
    private waiter_snip: JQuery<HTMLDivElement> = $('#waiter_snip')

    private manager: DocumentManager
    private CONTEXT_SIZE: number = 150

    private currentDoc: number
    private currentMarkable: number
    private currentMT: number
    private currentSection: number

    public constructor(private AID: string) {
        this.waiter_frame.show()

        // TODO
        this.currentDoc = 0
        this.currentMarkable = 0
        this.currentMT = 0
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
        this.display(MTS[this.currentMT], DOCS[this.currentDoc], this.currentMarkable, this.currentSection)
    }

    private display(mt: string, file: string, markable: number, index: number) {
        let [content, position]: [string, number] = this.manager.documents.get(file).display(markable, index)

        // left context align to neares non-space
        let offset_a = 0
        if (position - this.CONTEXT_SIZE > 0) {
            for (; offset_a < this.CONTEXT_SIZE; offset_a++) {
                if (content[position - this.CONTEXT_SIZE + offset_a].match(/\s/)) {
                    break
                }
            }
            if (offset_a == this.CONTEXT_SIZE) {
                throw new Error('Could not create reasonable left context')
            }
        }

        // right context align to neares non-space
        let offset_b = 0
        if (position + this.CONTEXT_SIZE < content.length) {
            for (; offset_b < this.CONTEXT_SIZE; offset_b++) {
                if (content[position + this.CONTEXT_SIZE - offset_b].match(/\s/)) {
                    break
                }
            }
            if (offset_b == this.CONTEXT_SIZE) {
                throw new Error('Could not create reasonable right context')
            }
        }

        content = content.substr(Math.max(0, position - this.CONTEXT_SIZE + offset_a), 2 * this.CONTEXT_SIZE - offset_b)
        this.waiter_snip.html(content)
    }

    private move_doc(offset: number) {
        if (this.currentDoc + offset < 0 || this.currentDoc + offset >= DOCS.length) {
            throw Error('Document index out of bounds')
        }
        this.currentDoc += offset
        this.reset_mkb()
        this.reset_sec()
        this.reset_mtr()
        this.display_current()
        this.update_stats()
    }

    private move_mkb(offset: number) {
        const markable_keys = this.manager.documents.get(DOCS[this.currentDoc]).markable_keys
        if (this.currentMarkable + offset < 0 || this.currentMarkable + offset >= markable_keys.length) {
            throw Error('Markable index out of bounds')
        }
        this.currentMarkable += offset
        this.reset_sec()
        this.reset_mtr()
        this.display_current()
        this.update_stats()
    }

    private move_sec(offset: number) {
        const sections = this.manager.documents.get(DOCS[this.currentDoc]).get_sections(this.currentMarkable)
        if (this.currentSection + offset < 0 || this.currentSection + offset >= sections.length) {
            throw Error('Section index out of bounds')
        }
        this.currentSection += offset
        this.reset_mtr()
        this.display_current()
        this.update_stats()
    }

    private reset_sec() {
        this.currentSection = 0
    }

    private reset_mtr() {
        this.currentMT = 0
    }

    private reset_mkb() {
        this.currentMarkable = 0
    }

    private update_stats() {
        let currentMarkables = this.manager.documents.get(DOCS[this.currentDoc]).markable_keys
        let currentSections = this.manager.documents.get(DOCS[this.currentDoc]).get_sections(this.currentMarkable)
        $('#totl_doc').text(`${this.currentDoc + 1}/${DOCS.length}`)
        $('#totl_mkb').text(`${this.currentMarkable + 1}/${currentMarkables.length}`)
        $('#totl_sec').text(`${this.currentSection + 1}/${currentSections.length}`)
        $('#totl_mtr').text(`${this.currentMT + 1}/${MTS.length}`)
    }
}