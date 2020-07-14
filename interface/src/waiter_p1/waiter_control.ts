import { DocumentManager } from "./document_manager"
import * as $ from 'jquery'
import { ModelDocumentMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"
import { UserProgress } from "./document_loader"

export type QuestionType = 'nonconf' | 'coherent' | 'lexical' | 'errors'

export class WaiterControl {
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
            let progress: UserProgress = await this.manager.load(AID)
            if (progress.finished()) {
                alert("You've already finished all stimuli. Exiting.")
                return
            }

            this.driver = new WaiterDriver(this.manager, progress)

            this.waiter_frame.show()
            this.waiter_nav.show()

            this.update_stats()
            this.display_current()

            $('#save_button_p1').click(() => this.save())
        })
    }

    public display_current() {
        this.update_stats()
        let docName = this.manager.data.queue_doc[this.driver.progress.doc]
        let mtName = this.manager.data.queue_mt[docName][this.driver.progress.mt]
        this.display(docName, mtName)
        this.model = new ModelDocumentMT(this.manager)
    }

    private display(docName: string, mtName: string) {
        let current_src = this.driver.current_doc_src()
        this.waiter_src_snip.html(current_src.displaySimple())

        let response_content = WaiterDisplayer.generateElements()
        this.waiter_tgt_table.html(response_content)

        let current_tgt = this.manager.currentMT(docName, mtName)
        this.waiter_tgt_snip.html(current_tgt.displaySimple())

        PageUtils.syncval()
        PageUtils.indeterminate()
        PageUtils.syncmodelP1(this)
        $('#save_button_p1').prop('disabled', true)
    }


    private update_stats() {
        let currentMts = this.driver.current_mts()
        $('#totl_doc_p1').text(`${this.driver.progress.doc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mt_p1').text(`${this.driver.progress.mt + 1}/${currentMts.length}`)
    }

    private save() {
        this.model.save(
            this.AID,
            this.driver.progress,
            this.driver.advanced(),
        )
        this.next()
    }

    private next() {
        let refresh = true
        if (this.driver.end_mt()) {
            this.driver.reset_mt()
            if (this.driver.end_doc()) {
                refresh = false
                alert('All work finished. Wait a few moments for the page to refresh.')
                // TODO: This is suspectible to a race condition, as the LOG request may not have finished by then
                window.setTimeout(() => window.location.reload(), 3000)
            } else {
                this.driver.move_doc(+1)
            }
        } else {
            this.driver.move_mt(+1)
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
}