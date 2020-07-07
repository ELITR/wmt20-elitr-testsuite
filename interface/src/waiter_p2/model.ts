import { DocumentLoader, UserProgress } from "../documents/document_loader"
import * as $ from 'jquery'
import { DEVMODE } from "../main"

export class Model {
    public documents: Array<[string, Array<ModelMarkable>]>
}

export class ModelMarkable {
    public segments: Array<ModelSegement>
}

export class ModelSegement {
    public mt_models: Array<ModelMT>

    public constructor(mts: string[]) {
        this.mt_models = mts.map((name:string) => new ModelMT(name))
    }

    public save(AID: string, current: UserProgress, progress: UserProgress) {
        let rating_serialized: { [key: string]: any } = {}
        this.mt_models.forEach((model: ModelMT) => rating_serialized[model.name] = model.toObject())

        $.ajax({
            method: 'POST',
            url: DocumentLoader.baseURL + 'save_p2',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mkb': current.mkb,
                    'sec': current.sec,
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