import { DocumentManager } from "./document_manager"
import * as $ from 'jquery'
import { ModelDocumentMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"
import { UserProgress } from "./document_loader"
import { BASEURL } from "../main"

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

            $('#prev_button_p1').click(() => {
                this.save_rating()
                this.prev()
                this.save_progress()
            })
            $('#next_button_p1').click(() => {
                this.save_rating()
                this.next()
                this.save_progress()
            })
        })
    }

    public display_current() {
        this.update_stats()
        let docName = this.manager.data.queue_doc[this.driver.progress.doc]
        let mtName = this.manager.data.queue_mt[docName][this.driver.progress.mt]

        this.model = new ModelDocumentMT(this.manager)
        let signature: string = this.model.signature(docName, mtName)
        let rating = this.manager.data.rating[signature] || {}
        console.log('Currently displaying:', signature)

        this.display(docName, mtName, rating)
    }

    private display(docName: string, mtName: string, rating: any) {
        let current_src = this.driver.current_doc()
        this.waiter_src_snip.html(current_src.displaySimple())

        let response_content = WaiterDisplayer.generateElements(rating)
        this.waiter_tgt_table.html(response_content)

        let current_tgt = this.manager.currentMT(docName, mtName)
        this.waiter_tgt_snip.html(current_tgt.displaySimple())

        PageUtils.syncval()
        PageUtils.listenModelP1(this)

        this.sync_next_button()
    }


    private update_stats() {
        let currentMts = this.driver.current_mts()
        $('#totl_doc_p1').text(`${this.driver.progress.doc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mt_p1').text(`${this.driver.progress.mt + 1}/${currentMts.length}`)
    }

    private save_rating() {
        this.model.save(
            this.AID,
            this.driver.progress
        )
    }

    private save_progress() {
        $.ajax({
            method: 'POST',
            url: BASEURL + 'save_progress_p1',
            data: JSON.stringify({
                'AID': this.AID,
                'progress': {
                    'doc': this.driver.progress.doc,
                    'mt': this.driver.progress.mt,
                },
            }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
        }).done((data: any) => {
            console.log(data)
        })
    }

    private next() {
        let refresh = true
        if (this.driver.end_mt()) {
            this.driver.progress.mt = 0

            if (this.driver.end_doc()) {
                refresh = false
                this.driver.progress.doc = this.driver.progress.mt = -1
                alert('All work finished. Wait a few moments for the page to refresh.')
                // TODO: This is suspectible to a race condition, as the LOG request may not have finished by then
                window.setTimeout(() => window.location.reload(), 3000)
            } else {
                this.driver.progress.doc += 1
                this.driver.progress.mt = 0
            }
        } else {
            this.driver.progress.mt += 1
        }

        if (refresh) {
            this.display_current()
        }
    }

    private prev() {
        if (this.driver.progress.mt == 0) {
            if (this.driver.progress.doc > 0) {
                this.driver.progress.doc -= 1
                let prevDocName = this.manager.data.queue_doc[this.driver.progress.doc]
                this.driver.progress.mt = this.manager.data.queue_mt[prevDocName].length - 1
            }
        } else {
            this.driver.progress.mt -= 1
        }
        this.display_current()
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

        this.sync_next_button()
    }

    private sync_next_button() {
        let not_resolved = !this.model.resolved()
        // $('#next_button_p1').prop('disabled', not_resolved)
        $('#next_button_p1').prop('disabled', false)
    }
}