declare var DEVMODE: boolean;

var DEVMODE_: boolean = DEVMODE
export { DEVMODE_ as DEVMODE }

import { WaiterControl } from "./waiter/waiter_control"
import * as $ from 'jquery'
import { PageUtils } from "./misc/page_utils"

$('#start_annotation').click(() => {
    let AIDEl = $('#annotator_id')
    let AID = AIDEl.val() as string
    if (AID.length == 0) {
        alert('Invalid Annotator ID')
        return
    }

    // Start the main routing
    AIDEl.prop('disabled', true)
    $('#start_annotation').hide()
    new WaiterControl(AID)
})

if (DEVMODE) {
    $('#annotator_id').val('testuser')
    $('#start_annotation').trigger('click')
}

