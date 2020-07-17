import { DocumentManager } from "./document_manager"
import * as $ from 'jquery'
import { ModelDocumentMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"
import { UserProgress } from "./document_loader"
import { BASEURL } from "../main"

export type QuestionType = 'nonconf' | 'fluency' | 'adequacy' | 'errors'

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_p1_frame')
    private waiter_nav: JQuery<HTMLDivElement> = $('#waiter_p1_nav')
    private waiter_src_snip: JQuery<HTMLDivElement> = $('#src_snip_p1')
    private waiter_tgt_snip: JQuery<HTMLDivElement> = $('#tgt_snip_p1')
    private waiter_tgt_table: JQuery<HTMLDivElement> = $('#waiter_p1_tgt_table')
    private focus_button: JQuery<HTMLInputElement> = $('#focus_button_p1')
    private prev_button: JQuery<HTMLInputElement> = $('#prev_button_p1')
    private next_button: JQuery<HTMLInputElement> = $('#next_button_p1')

    private static DIFFERENT_DOCUMENT_MSG = 'You annotated all translations of one document. Moving to the next one.'
    private static ALL_FINISHED_MSG = 'All work finished. Wait a few moments for the page to refresh.'

    private manager: DocumentManager = new DocumentManager()
    private driver: WaiterDriver
    private model: ModelDocumentMT

    public constructor(private AID: string, successCallback: () => void) {
        this.manager.load(AID).then((progress: UserProgress) => {
            if (progress.finished()) {
                alert("You've already finished all stimuli. Exiting.")
                return
            }
            successCallback()

            this.driver = new WaiterDriver(this.manager, progress)

            this.waiter_frame.show()
            this.waiter_nav.show()

            this.update_stats()
            this.display_current()

            this.prev_button.click(() => {
                this.save_rating()
                this.prev()
                this.save_progress()
            })
            this.next_button.click(() => {
                this.save_rating()
                this.next()
                this.save_progress()
            })
            this.focus_button.click(() => PageUtils.scrollIntoViewP1())
        })
    }

    public display_current() {
        this.update_stats()
        let docName = this.manager.data.queue_doc[this.driver.progress.doc]
        let mtName = this.manager.data.queue_mt.get(docName)[this.driver.progress.mt]

        this.model = new ModelDocumentMT(this.manager)
        console.log(`Currently displaying: ${docName}-${mtName}-${this.driver.progress.sent}`)
        let rating = this.manager.data.rating.get(docName, mtName, this.driver.progress.sent)

        let current_src = this.driver.current_doc()
        this.waiter_src_snip.html(current_src.displayLine(this.driver.progress.sent))

        let response_content = WaiterDisplayer.generateElements(rating)
        this.waiter_tgt_table.html(response_content)

        let current_tgt = this.driver.current_mt()
        this.waiter_tgt_snip.html(current_tgt.displayLine(this.driver.progress.sent))

        PageUtils.syncval()
        PageUtils.listenModelP1(this)
        PageUtils.scrollIntoViewP1()

        this.sync_next_button()
    }

    private update_stats() {
        let currentMts = this.driver.current_mts()
        $('#totl_doc_p1').text(`${this.driver.progress.doc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mt_p1').text(`${this.driver.progress.mt + 1}/${currentMts.length}`)
        $('#totl_sent_p1').text(`${this.driver.progress.sent + 1}/${this.driver.current_doc().lines}`)

        this.prev_button.prop('disabled', this.driver.progress.beginning())
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
                    'sent': this.driver.progress.sent,
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

        if (this.driver.end_sent()) {
            this.driver.progress.sent = 0

            if (this.driver.end_mt()) {
                this.driver.progress.mt = 0

                if (this.driver.end_doc()) {
                    refresh = false
                    this.driver.progress.doc = this.driver.progress.mt = this.driver.progress.sent = -1

                    alert(WaiterControl.ALL_FINISHED_MSG)
                    // TODO: This is suspectible to a race condition, as the LOG request may not have finished by then
                    window.setTimeout(() => window.location.reload(), 3000)
                } else {
                    alert(WaiterControl.DIFFERENT_DOCUMENT_MSG)
                    this.driver.progress.doc += 1
                }
            } else {
                this.driver.progress.mt += 1
            }
        } else {
            this.driver.progress.sent += 1
        }

        if (refresh) {
            this.display_current()
        }
    }

    private prev() {
        if (this.driver.progress.sent == 0) {
            if (this.driver.progress.mt == 0) {
                if (this.driver.progress.doc > 0) {
                    this.driver.progress.doc -= 1
                    this.driver.progress.mt = this.manager.data.queue_mt.get(this.driver.current_docName()).length - 1
                    this.driver.progress.sent = this.driver.current_doc().lines - 1
                }
            } else {
                this.driver.progress.mt -= 1
                this.driver.progress.sent = this.driver.current_doc().lines - 1
            }
        } else {
            this.driver.progress.sent -= 1
        }
        this.display_current()
    }

    public input_info(type: QuestionType, value: boolean | number | string) {
        if (type == 'nonconf') {
            this.model.nonconflicting = value as boolean
        } else if (type == 'fluency') {
            this.model.fluency = value as number
        } else if (type == 'adequacy') {
            this.model.adequacy = value as number
        } else if (type == 'errors') {
            this.model.errors = value as string
        }

        this.sync_next_button()
    }

    private sync_next_button() {
        let not_resolved = !this.model.resolved()
        $('#next_button_p1').prop('disabled', not_resolved)
    }
}