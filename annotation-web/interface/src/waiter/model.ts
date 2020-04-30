import { MTS } from "../documents/document_loader"

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

    public update(mt: number) {

    }

    public upload() {

    }
}

export class ModelMT {
    public translated?: boolean
    public acceptable?: number
    public non_conflicting?: number

    public resolved(): boolean {
        return (this.translated != undefined && this.acceptable != undefined && this.non_conflicting != undefined)
    }
}