import { DocumentLoader, UserProgress } from "./document_loader"
import * as $ from 'jquery'
import { DEVMODE } from "../main"
import { DocumentManager } from "./document_manager"

export class Model {
    public documents: Array<[string, Array<ModelMarkable>]>
}

export class ModelMarkable {
    public segments: Array<ModelSegement>
}

export class ModelSegement {
    public mtModels: Array<ModelMT>
    
    public constructor(private manager: DocumentManager) {
        this.mtModels = this.manager.data.mts.map((mtName: string) => new ModelMT(mtName))
     }

    public save(AID: string, current: UserProgress, progress: UserProgress) {
        let serializedRatings: { [key: string]: any } = {}
        this.mtModels.forEach((model: ModelMT) => serializedRatings[model.name] = model.toObject())
        
        let docName = this.manager.data.queue_doc[current.doc]
        let mkbName = this.manager.data.content_src.get(docName).markable_keys[current.mkb]

        this.manager.data.rating[this.signature(docName, mkbName, current.sec)] = serializedRatings

        $.ajax({
            method: 'POST',
            url: DocumentLoader.baseURL + 'save_p2',
            data: JSON.stringify({
                'AID': AID,
                'current': {
                    'doc': current.doc,
                    'mkb': current.mkb,
                    'sec': current.sec,
                    'doc_name': docName,
                    'mkb_name': mkbName,
                },
                'progress': {
                    'doc': progress.doc,
                    'mkb': progress.mkb,
                    'sec': progress.sec,
                },
                'rating': serializedRatings,
            }),
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
        }).done((data: any) => {
            console.log(data)
        })
    }

    public signature(docName: string, mkbName: string, sec: number): string {
        return `${docName}-${mkbName}-${sec}`
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
            throw new Error('Attempted to serialize an unresolved model object')
        }
        return { translated: this.translated as boolean, adequacy: this.adequacy as number, fluency: this.fluency as number, errors: this.errors as string }
    }
}