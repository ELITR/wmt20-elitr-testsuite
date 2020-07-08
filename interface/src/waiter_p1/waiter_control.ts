import { DocumentManager } from "../documents/document_manager"
import * as $ from 'jquery'
import { ModelDocumentMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"
import { UserProgressP1 } from "../documents/document_loader"

export type QuestionType = 'nonconf' | 'coherent' | 'lexical' | 'errors'

export class WaiterControlP1 {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_p1_frame')
    private waiter_nav: JQuery<HTMLDivElement> = $('#waiter_p1_nav')
    private waiter_src_snip: JQuery<HTMLDivElement> = $('#src_snip_p1')
    private waiter_tgt_snip: JQuery<HTMLDivElement> = $('#tgt_snip_p1')
    private waiter_tgt_table: JQuery<HTMLDivElement> = $('#waiter_p1_tgt_table')

    private manager: DocumentManager = new DocumentManager()
    private driver: WaiterDriver
    private model: ModelDocumentMT

    public constructor(private AID: string) {
        new Promise(async () => {
            let progress: UserProgressP1 = await this.manager.loadP1(AID)
            if(progress.finished()) {
                alert("You've already finished all stimuli. Exiting.")
                return
            }

            this.driver = new WaiterDriver(this.manager, progress)

            this.waiter_frame.show()
            this.waiter_nav.show()

            this.update_stats()
            this.display_current()
            this.update_buttons()

            $('#save_button_p1').click(() => this.save())
        })
    }

    public display_current() {
        this.update_stats()
        this.display(this.manager.data.queue_doc[this.driver.progress.doc], this.driver.progress.mkb, this.driver.progress.mtn)
        // TODO: get model name
        this.model = new ModelDocumentMT(this.manager.data.mts[this.driver.progress.mtn])
    }

    private display(file: string, markable: number, mtn: number) {
        let current_src = this.driver.current_doc_src()
        this.waiter_src_snip.html(current_src.displayAll(markable))

        let response_content = WaiterDisplayer.generateElements()
        this.waiter_tgt_table.html(response_content)

        let current_tgt = this.manager.currentMT(file, mtn)
        this.waiter_tgt_snip.html(current_tgt.displayAll(current_src, markable))

        PageUtils.syncval()
        PageUtils.indeterminate()
        PageUtils.syncmodelP1(this)
        $('#save_button_p1').prop('disabled', true)
    }


    private update_stats() {
        console.warn('updating stats')
        let currentMarkables = this.driver.current_doc_src().markable_keys
        let currentSections = this.driver.current_doc_src().get_sections(this.driver.progress.mkb)
        $('#totl_doc_p1').text(`${this.driver.progress.doc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mkb_p1').text(`${this.driver.progress.mkb + 1}/${currentMarkables.length}`)
        $('#totl_mtn_p1').text(`${this.driver.progress.mtn + 1}/${currentSections.length}`)
        $('#text_mkb').text(`Markable (${currentMarkables[this.driver.progress.mkb]}):`)
        this.update_buttons()
    }

    private update_buttons() {
        $('#next_doc').prop('disabled', this.driver.progress.doc >= this.manager.data.queue_doc.length - 1)
        $('#prev_doc').prop('disabled', this.driver.progress.doc <= 0)

        const markable_keys = this.driver.current_doc_src().markable_keys
        $('#next_mkb').prop('disabled', this.driver.progress.mkb >= markable_keys.length - 1)
        $('#prev_mkb').prop('disabled', this.driver.progress.mkb <= 0)
    }

    private save() {
        this.model.save(
            this.AID,
            this.driver.progress,
            this.driver.advanced()
        )
        this.next()
    }

    private next() {
        let refresh = true
        if (this.driver.end_mtn()) {
            this.driver.reset_mtn()
            if (this.driver.end_mkb()) {
                this.driver.reset_mkb()
                if (this.driver.end_doc()) {
                    refresh = false
                    alert('All work finished. Wait a few moments for the page to refresh.')
                    // TODO: This is suspectible to a race condition, as the LOG request may not have finished by then
                    window.setTimeout(() => window.location.reload(), 3000)
                } else {
                    this.driver.move_doc(+1)
                }
            } else {
                this.driver.move_mkb(+1)
            }
        } else {
            this.driver.move_sec(+1)
        }

        if (refresh) {
            this.display_current()
        }
    }

    public input_info(type: QuestionType, value: boolean | number | string) {
        if (type == 'nonconf') {
            this.model.nonconflicting = value as boolean
        } else if (type == 'coherent') {
            this.model.coherent = value as number
        } else if (type == 'errors') {
            this.model.errors = value as string
        } else if (type == 'lexical') {
            this.model.lexical = value as number
        }

        let not_resolved = !this.model.resolved()
        $('#save_button_p1').prop('disabled', not_resolved)
    }

    public end_sec() {

    }
}