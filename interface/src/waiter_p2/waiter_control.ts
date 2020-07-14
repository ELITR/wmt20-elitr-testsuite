import { DocumentManager } from "./document_manager"
import * as $ from 'jquery'
import { ModelSegement, ModelMT } from "./model"
import { WaiterDriver } from "./waiter_driver"
import { WaiterDisplayer } from "./waiter_displayer"
import { PageUtils } from "../misc/page_utils"
import { UserProgress } from "./document_loader"

export type QuestionType = 'translated' | 'fluency' | 'adequacy' | 'errors'

export class WaiterControl {
    private waiter_frame: JQuery<HTMLDivElement> = $('#waiter_p2_frame')
    private waiter_nav: JQuery<HTMLDivElement> = $('#waiter_p2_nav')
    private waiter_src_snip: JQuery<HTMLDivElement> = $('#src_snip_p2')
    private waiter_tgt_table: JQuery<HTMLDivElement> = $('#waiter_p2_tgt_table')

    private manager: DocumentManager = new DocumentManager()
    private driver: WaiterDriver
    private model: ModelSegement

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
            this.update_buttons()

            $('#save_button_p2').click(() => this.save())
            $('#prev_button_p2').click(() => this.prev())
        })
    }

    public display_current() {
        this.update_stats()
        let docName: string = this.manager.data.queue_doc[this.driver.progress.doc]
        console.log(this.manager.data.queue_mkb.get(docName))
        let mkbName: string = this.manager.data.queue_mkb.get(docName)[this.driver.progress.mkb]

        this.model = new ModelSegement(this.manager)

        let signature: string = this.model.signature(docName, mkbName, this.driver.progress.sec)
        let rating = this.manager.data.rating[signature] || {}

        this.display(docName, this.driver.progress.mkb, this.driver.progress.sec, rating)
    }

    private display(file: string, markable: number, index: number, rating: { [mt: string]: any }) {
        let current_src = this.driver.current_doc()
        this.waiter_src_snip.html(current_src.display(markable, index))

        let snippets: Array<[string, string]> = this.manager.getAllMT(file).map(
            ([key, doc]) => [key, doc.display(current_src, markable, index)]
        )

        let content = WaiterDisplayer.generateElements(snippets, rating)
        this.waiter_tgt_table.html(content)

        PageUtils.syncval()
        PageUtils.indeterminate()
        PageUtils.syncmodelP2(this)

        this.sync_save_button()
    }


    private update_stats() {
        let currentMarkables = this.driver.current_doc().markable_keys
        let currentSections = this.driver.current_doc().get_sections(this.driver.progress.mkb)
        $('#totl_doc_p2').text(`${this.driver.progress.doc + 1}/${this.manager.data.queue_doc.length}`)
        $('#totl_mkb_p2').text(`${this.driver.progress.mkb + 1}/${currentMarkables.length}`)
        $('#totl_sec_p2').text(`${this.driver.progress.sec + 1}/${currentSections.length}`)
        $('#text_mkb').text(`Markable (${currentMarkables[this.driver.progress.mkb]}):`)
        this.update_buttons()
    }

    private update_buttons() {
        $('#next_doc').prop('disabled', this.driver.progress.doc >= this.manager.data.queue_doc.length - 1)
        $('#prev_doc').prop('disabled', this.driver.progress.doc <= 0)

        const markable_keys = this.driver.current_doc().markable_keys
        $('#next_mkb').prop('disabled', this.driver.progress.mkb >= markable_keys.length - 1)
        $('#prev_mkb').prop('disabled', this.driver.progress.mkb <= 0)

        const sections = this.driver.current_doc().get_sections(this.driver.progress.mkb)
        $('#next_sec').prop('disabled', this.driver.progress.sec >= sections.length - 1)
        $('#prev_sec').prop('disabled', this.driver.progress.sec <= 0)
    }

    private save() {
        this.model.save(
            this.AID,
            this.driver.progress,
            this.driver.progress_next()
        )
        this.next()
    }

    private next() {
        let refresh = true
        if (this.driver.end_sec()) {
            this.driver.progress.sec = 0
            if (this.driver.end_mkb()) {
                this.driver.progress.mkb = 0
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


    private prev() {
        if (this.driver.progress.sec == 0) {
            if (this.driver.progress.mkb == 0) {
                if (this.driver.progress.doc > 0) {
                    console.log('back')
                    this.driver.progress.doc -= 1
                    let prevDocName = this.manager.data.queue_doc[this.driver.progress.doc]
                    let prevDoc = this.manager.data.content_src.get(prevDocName)
                    this.driver.progress.mkb = prevDoc.markable_keys.length - 1
                    this.driver.progress.sec = prevDoc.get_sections(this.driver.progress.mkb).length -= 1
                }
            } else {
                this.driver.progress.mkb -= 1
                let prevDocName = this.manager.data.queue_doc[this.driver.progress.doc]
                let prevDoc = this.manager.data.content_src.get(prevDocName)
                this.driver.progress.sec = prevDoc.get_sections(this.driver.progress.mkb).length -= 1
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

        this.sync_save_button()
    }

    private sync_save_button() {
        let not_resolved = this.model.mtModels.some((value: ModelMT) => !value.resolved())
        $('#save_button_p2').prop('disabled', not_resolved)
    }
}