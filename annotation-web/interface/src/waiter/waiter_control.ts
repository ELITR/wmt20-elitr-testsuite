import { DocumentManager, DocSrcArray, DocTgtArray } from "../documents/document_manager"
import * as $ from 'jquery'
import { ModelSegement, ModelMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"

export type QuestionType = 'translated' | 'acceptable' | 'non-conflicting'

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_frame')
    private waiter_src_snip: JQuery<HTMLDivElement> = $('#src_snip')
    private waiter_tgt_table: JQuery<HTMLDivElement> = $('#waiter_tgt_table')

    private manager: DocumentManager = new DocumentManager()
    private driver: WaiterDriver = new WaiterDriver(this.manager)
    private model: ModelSegement


    public constructor(private AID: string) {
        this.waiter_frame.show()

        $('#next_doc').click(() => { this.driver.move_doc(+1); this.display_current() })
        $('#prev_doc').click(() => { this.driver.move_doc(-1); this.display_current() })
        $('#next_mkb').click(() => { this.driver.move_mkb(+1); this.display_current() })
        $('#prev_mkb').click(() => { this.driver.move_mkb(-1); this.display_current() })
        $('#next_sec').click(() => { this.driver.move_sec(+1); this.display_current() })
        $('#prev_sec').click(() => { this.driver.move_sec(-1); this.display_current() })

        new Promise(async () => {
            await this.manager.load(AID)
            this.update_stats()
            this.display_current()
            this.update_buttons()

            $('#save_button').click(this.save)
        })
    }

    public display_current() {
        this.update_stats()
        this.display(this.manager.data.queue_doc[this.driver.currentDoc], this.driver.currentMarkable, this.driver.currentSection)
        this.model = new ModelSegement(this.manager.data.mts)
    }

    private display(file: string, markable: number, index: number) {
        let current_src = this.driver.current_doc_src()
        this.waiter_src_snip.html(current_src.display(markable, index))

        let snippets: Array<[string, string]> = this.manager.getAllMT(file).map(
            ([key, doc]) => [key, doc.display(current_src, markable, index)]
        )

        let content = WaiterDisplayer.generateElements(snippets)
        this.waiter_tgt_table.html(content)

        PageUtils.syncval()
        PageUtils.indeterminate()
        PageUtils.syncmodel(this)
        $('#save_button').prop('disabled', true)
    }


    private update_stats() {
        let currentMarkables = this.driver.current_doc_src().markable_keys
        let currentSections = this.driver.current_doc_src().get_sections(this.driver.currentMarkable)
        $('#totl_doc').text(`${this.driver.currentDoc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mkb').text(`${this.driver.currentMarkable + 1}/${currentMarkables.length}`)
        $('#totl_sec').text(`${this.driver.currentSection + 1}/${currentSections.length}`)
        this.update_buttons()
    }

    private update_buttons() {
        $('#next_doc').prop('disabled', this.driver.currentDoc >= this.manager.data.queue_doc.length - 1)
        $('#prev_doc').prop('disabled', this.driver.currentDoc <= 0)

        const markable_keys = this.driver.current_doc_src().markable_keys
        $('#next_mkb').prop('disabled', this.driver.currentMarkable >= markable_keys.length - 1)
        $('#prev_mkb').prop('disabled', this.driver.currentMarkable <= 0)

        const sections = this.driver.current_doc_src().get_sections(this.driver.currentMarkable)
        $('#next_sec').prop('disabled', this.driver.currentSection >= sections.length - 1)
        $('#prev_sec').prop('disabled', this.driver.currentSection <= 0)
    }

    private save() {
        // TODO
        throw new Error('Saving is not implemented yet')
    }

    public input_info(type: QuestionType, index: number, value: boolean | number) {
        if (type == 'translated') {
            this.model.mts[index].translated = value as boolean
        } else if (type == 'acceptable') {
            this.model.mts[index].acceptable = value as number
        } else if (type == 'non-conflicting') {
            this.model.mts[index].non_conflicting = value as number
        }

        let not_resolved = this.model.mts.some((value: ModelMT) => !value.resolved())
        $('#save_button').prop('disabled', not_resolved)
    }
}