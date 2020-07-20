import '../misc/object_utils'

export class WaiterDisplayer {

    public static generateElements(snippets: Array<[string, string]>, rating: { [mt: string]: any }): string {
        let output = snippets.map(([key, value], index: number) => {
            let mtRating = rating[key] || {}
            return `
            <div class='div_snip tgt_snip_p1'>${value}</div>
            
            <div class='waiter_p1_response'>
                <div>
                <div>Fluency:</div>
                <div class='waiter_p2_response_single'>
                    <input id='val_${index}_fluency' index='${index}' ${mtRating.fluency == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${mtRating.fluency ?? -1}'>
                    <div id='val_${index}_fluency_text'>-</div>
                </div>
                </div>
                
                <div>
                <div>Adequacy:</div>
                <div class='waiter_p2_response_single'>
                    <input id='val_${index}_adequacy' index='${index}' ${mtRating.adequacy == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${mtRating.adequacy ?? -1}'>
                    <div id='val_${index}_adequacy_text'>-</div>
                </div>
                </div>

                <div>
                    <div>Non-conflicting markables:</div>
                    <div class='waiter_p1_response_single'>
                        <input id='val_${index}_nonconf' index='${index}' class='synctext' type='checkbox' ${mtRating.nonconflicting == undefined ? '' : 'trigger'} value='${mtRating.nonconflicting ?? -1}'>
                        <div id='val_${index}_nonconf_text'>-</div>
                    </div>
                </div>

                <div>
                    <div>Bad markables:</div>
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