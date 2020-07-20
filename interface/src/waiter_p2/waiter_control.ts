import { DocumentManager } from "./document_manager"
import * as $ from 'jquery'
import { ModelSegement, ModelMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"
import { UserProgress } from "./document_loader"
import { BASEURL } from "../main"

export type QuestionType = 'translated' | 'fluency' | 'adequacy' | 'errors'

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_p2_frame')
    private waiter_nav: JQuery<HTMLDivElement> = $('#waiter_p2_nav')
    private waiter_src_snip: JQuery<HTMLDivElement> = $('#src_snip_p2')
    private waiter_tgt_table: JQuery<HTMLDivElement> = $('#waiter_p2_tgt_table')
    private focus_button: JQuery<HTMLInputElement> = $('#focus_button_p2')
    private prev_button: JQuery<HTMLInputElement> = $('#prev_button_p2')
    private next_button: JQuery<HTMLInputElement> = $('#next_button_p2')

    private static DIFFERENT_DOCUMENT_MSG = 'You annotated all markables of one document. Moving to the next one.'
    private static DIFFERENT_MARKABLE_MSG = 'You annotated all occurences of the current markable. Moving to the next one.'
    private static ALL_FINISHED_MSG = 'All work finished. Wait a few moments for the page to refresh.'

    private manager: DocumentManager = new DocumentManager()
    private driver!: WaiterDriver
    private model!: ModelSegement

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
            this.focus_button.click(() => PageUtils.scrollIntoView())
        })
    }

    public display_current() {
        this.update_stats()
        let docName: string = this.manager.data.queue_doc[this.driver.progress.doc]
        let mkbName: string = this.manager.data.queue_mkb.get(docName)![this.driver.progress.mkb]

        this.model = new ModelSegement(this.manager)

        let rating = this.manager.data.rating.get(docName, mkbName, this.driver.progress.sec)
        console.log(`Currently displaying: ${docName}-${mkbName}-${this.driver.progress.sec}`)

        let markableName = this.driver.currentMarkableName()

        let current_src = this.driver.currentDoc()
        this.waiter_src_snip.html(current_src.display(markableName, this.driver.progress.sec))

        let snippets: Array<[string, string]> = this.manager.getAllMT(docName).map(
            ([key, doc]) => [key, doc.displayMarkable(current_src, markableName, this.driver.progress.sec)]
        )

        let content = WaiterDisplayer.generateElements(snippets, rating)
        this.waiter_tgt_table.html(content)

        PageUtils.syncval()
        PageUtils.listenModelP2(this)
        PageUtils.scrollIntoView()

        this.sync_next_button()
    }

    private update_stats() {
        const currentMarkables = this.manager.data.queue_mkb.get(this.driver.currentDocName())!
        $('#totl_doc_p2').text(`${this.driver.progress.doc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mkb_p2').text(`${this.driver.progress.mkb + 1}/${currentMarkables.length}`)

        let currentSections = this.driver.currentDoc().sections(this.driver.currentMarkableName())
        $('#totl_sec_p2').text(`${this.driver.progress.sec + 1}/${currentSections.length}`)
        $('#text_mkb').text(`Markable (${currentMarkables[this.driver.progress.mkb]}):`)

        this.prev_button.prop('disabled', this.driver.progress.beginning())
    }

    private save_rating() {
        this.model.save(
            this.AID,
            this.driver.progress,
        )
    }

    private save_progress() {
        $.ajax({
            method: 'POST',
            url: BASEURL + 'save_progress_p2',
            data: JSON.stringify({
                'AID': this.AID,
                'progress': {
                    'doc': this.driver.progress.doc,
                    'mkb': this.driver.progress.mkb,
                    'sec': this.driver.progress.sec
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
        if (this.driver.end_sec()) {
            this.driver.progress.sec = 0

            if (this.driver.end_mkb()) {
                this.driver.progress.mkb = 0

                if (this.driver.end_doc()) {
                    refresh = false
                    this.driver.progress.doc = this.driver.progress.mkb = this.driver.progress.sec = -1

                    alert(WaiterControl.ALL_FINISHED_MSG)
                    // TODO: This is suspectible to a race condition, as the LOG request may not have finished by then
                    window.setTimeout(() => window.location.reload(), 3000)
                } else {
                    alert(WaiterControl.DIFFERENT_DOCUMENT_MSG)
                    this.driver.progress.doc += 1
                }
            } else {
                alert(WaiterControl.DIFFERENT_MARKABLE_MSG)
                this.driver.progress.mkb += 1
            }
        } else {
            this.driver.progress.sec += 1
        }

        if (refresh) {
            this.display_current()
        }
    }

    private prev() {
        if (this.driver.progress.sec == 0) {
            if (this.driver.progress.mkb == 0) {
                if (this.driver.progress.doc > 0) {
                    this.driver.progress.doc -= 1

                    let prevDocName = this.driver.currentDocName()
                    let prevDoc = this.driver.currentDoc()
                    let mkbQueue = this.manager.data.queue_mkb

                    this.driver.progress.mkb = mkbQueue.get(prevDocName)!.length - 1

                    let prevMarkableName = mkbQueue.get(prevDocName)![this.driver.progress.mkb]
                    this.driver.progress.sec = prevDoc.sections(prevMarkableName).length - 1
                }
            } else {
                this.driver.progress.mkb -= 1

                let prevDocName = this.driver.currentDocName()
                let prevDoc = this.driver.currentDoc()

                let prevMarkableName = this.manager.data.queue_mkb.get(prevDocName)![this.driver.progress.mkb]
                this.driver.progress.sec = prevDoc.sections(prevMarkableName).length - 1
            }
        } else {
            this.driver.progress.sec -= 1
        }
        this.display_current()
    }

    public input_info(type: QuestionType, index: number, value: boolean | number | string) {
        if (type == 'translated') {
            this.model.mtModels[index].translated = value as boolean
        } else if (type == 'adequacy') {
            this.model.mtModels[index].adequacy = value as number
        } else if (type == 'fluency') {
            this.model.mtModels[index].fluency = value as number
        } else if (type == 'errors') {
            this.model.mtModels[index].errors = value as string
        }

        this.sync_next_button()
    }

    private sync_next_button() {
        let not_resolved = this.model.mtModels.some((value: ModelMT) => !value.resolved())
        $('#next_button_p2').prop('disabled', not_resolved)
    }
}