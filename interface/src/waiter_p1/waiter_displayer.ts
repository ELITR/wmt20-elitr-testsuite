import '../misc/object_utils'

export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>, rating: { [mt: string]: any }): string {
        let output = snippets.map(([key, value], index: number) => {
            let mtRating = rating[key] || {}
            return `
            <div class='div_snip tgt_snip_p1'>${value}</div>
            
            <div class='waiter_p1_response'>
                <div class='waiter_p2_response_single'>
                    <div>Fluency:</div>
                    <input id='val_${index}_fluency' index='${index}' ${mtRating.fluency == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${mtRating.fluency ?? -1}'>
                    <label for='val_${index}_fluency' id='val_${index}_fluency_text'>-</label>
                </div>
                
                <div class='waiter_p2_response_single'>
                    <div>Adequacy:</div>
                    <input id='val_${index}_adequacy' index='${index}' ${mtRating.adequacy == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${mtRating.adequacy ?? -1}'>
                    <label for='val_${index}_adequacy' id='val_${index}_adequacy_text'>-</label>
                </div>

                <div class='waiter_p1_response_single'>
                    <div>Conflicting markables:</div>
                    <input id='val_${index}_conflicting' index='${index}' class='synctext' type='checkbox' trigger ${mtRating.conflicting == undefined ? '' : (mtRating.conflicting ? 'checked' : '')}>
                    <label for='val_${index}_conflicting' id='val_${index}_conflicting_text'>-</label>
                </div>

                <div>
                    <div>Wrong markables:</div>
                    <div class='waiter_p1_response_single'>
                        <textarea id='val_${index}_errors' index='${index}' ${mtRating.errors == undefined ? '' : 'trigger'} class='synctext'>${mtRating.errors ?? ''}</textarea>
                    </div>
                </div>
            </div>

            <br>
        `
        }).reduce((prev: string, current: string) => prev + current)

        return output
    }
}