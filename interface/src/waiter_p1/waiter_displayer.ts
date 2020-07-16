import '../misc/object_utils'

export class WaiterDisplayer {

    public static generateElements(rating: any): string {
        return `
            <div class='waiter_p1_response'>
                <div>
                <div>Fluency:</div>
                <div class='waiter_p2_response_single'>
                    <input id='val_fluency' ${rating.fluency == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${rating.fluency ?? -1}'>
                    <div id='val_fluency_text'>-</div>
                </div>
                </div>
                
                <div>
                <div>Adequacy:</div>
                <div class='waiter_p2_response_single'>
                    <input id='val_adequacy' ${rating.adequacy == undefined ? '' : 'trigger'} class='synctext' type='range' min='0' , max='1' , step='0.1' value='${rating.adequacy ?? -1}'>
                    <div id='val_adequacy_text'>-</div>
                </div>
                </div>

                <div>
                    <div>Non-conflicting markables:</div>
                    <div class='waiter_p1_response_single'>
                        <input id='val_nonconf' class='synctext' type='checkbox' ${rating.nonconflicting == undefined ? '' : 'trigger'} value='${rating.nonconflicting ?? -1}'>
                        <div id='val_nonconf_text'>-</div>
                    </div>
                </div>

                <div>
                    <div>Bad markables:</div>
                    <div class='waiter_p1_response_single'>
                        <textarea id='val_errors' ${rating.errors == undefined ? '' : 'trigger'} class='synctext'>${rating.errors ?? ''}</textarea>
                    </div>
                </div>

            </div>
        `
    }
}