import { DocumentLoader, UserProgress } from "./document_loader"
import * as $ from 'jquery'
import { DEVMODE } from "../main"

export class Model {
    public documents: Array<[string, Array<ModelMarkable>]>
}

export class ModelMarkable {
    public segments: Array<ModelSegement>
}

export class ModelSegement {
    public mtModels: Array<ModelMT>
    
    // These strings and the progress object now create two sources of truth, which is bad
    public mkbName: string
    public docName: string

    public constructor(mts: string[], mkbName: string, docName: string) {
        this.mtModels = mts.map((name: string) => new ModelMT(name))
        this.mkbName = mkbName
        this.docName = docName
    }

    public save(AID: string, current: UserProgress, progress: UserProgress) {
        let rating_serialized: { [key: string]: any } = {}
        this.mtModels.forEach((model: ModelMT) => rating_serialized[model.name] = model.toObject())

        $.ajax({
            method: 'POST',
            url: DocumentLoader.baseURL + 'save_p2',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mkb': current.mkb,
                    'sec': current.sec,
                    'mkb_name': this.mkbName,
                    'doc_name': this.docName,
                },
                'progress': {
                    'doc': progress.doc,
                    'mkb': progress.mkb,
                    'sec': progress.sec,
                },
                'rating': rating_serialized,
            }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
        }).done((data: any) => {
            console.log(data)
        })
    }
}

export class ModelMT {
    public translated?: boolean
    public adequacy?: number
    public fluency?: number
    public errors: string

    public name: string

    public constructor(name: string) {
        this.name = name
    }

    public resolved(): boolean {
        if (DEVMODE)
            return true
        else
            return (this.translated != undefined && this.adequacy != undefined && this.fluency != undefined)
    }

    public toObject(): any {
        if (!this.resolved()) {
            throw new Error('Attempted to jsonify an unresolved model object')
        }
        return { translated: this.translated as boolean, adequacy: this.adequacy as number, fluency: this.fluency as number, errors: this.errors as string }
    }
}