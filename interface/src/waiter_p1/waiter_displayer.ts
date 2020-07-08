import '../misc/shuffle'

export class WaiterDisplayer {

    public static generateElements(): string {
            return `
            <div class='waiter_p1_response'>
                <div>
                    <div>Coherence:</div>
                    <div class='waiter_p1_response_single'>
                        <input id='val_coherent' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                        <div id='val_coherent_text'>-</div>
                    </div>
                </div>
                
                <div>
                    <div>Adequate lexical choice:</div>
                    <div class='waiter_p1_response_single'>
                        <input id='val_lexical' class='synctext' type='range' min='0' , max='1' , step='0.1' value='-1'>
                        <div id='val_lexical_text'>-</div>
                    </div>
                </div>

                <div>
                    <div>Non-conflicting?</div>
                    <div class='waiter_p1_response_single'>
                        <input id='val_nonconf' class='synctext' type='checkbox' value='-1'>
                        <div id='val_nonconf_text'>-</div>
                    </div>
                </div>

                <div>
                    <div>Mistakes:</div>
                    <div class='waiter_p1_response_single'>
                        <textarea id='val_errors' class='synctext'></textarea>
                    </div>
                </div>

            </div>
        `
    }
}