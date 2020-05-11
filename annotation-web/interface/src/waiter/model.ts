import { DocumentLoader, UserProgress } from "../documents/document_loader"
import * as $ from 'jquery'

export class Model {
    public documents: Array<[string, Array<ModelMarkable>]>
}

export class ModelMarkable {
    public segments: Array<ModelSegement>
}

export class ModelSegement {
    public mts: Array<ModelMT>

    public constructor(mts: string[]) {
        this.mts = mts.map(() => new ModelMT())
    }

    public save(AID: string, current: UserProgress, progress: UserProgress) {
        $.ajax({
            method: 'POST',
            url: DocumentLoader.baseURL + 'save',
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
                'rating': this.mts.map((value: ModelMT) => value.toObject())
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
    public acceptable?: number
    public non_conflicting?: number

    public resolved(): boolean {
        return true
        return (this.translated != undefined && this.acceptable != undefined && this.non_conflicting != undefined)
    }

    public toObject(): any {
        if (!this.resolved()) {
            throw new Error('Attempted to jsonify an unresolved model object')
        }
        return { translated: this.translated as boolean, acceptable: this.acceptable as number, non_conflicting: this.non_conflicting as number }
    }
}