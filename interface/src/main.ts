declare var DEVMODE: boolean;
var DEVMODE_: boolean = DEVMODE
var BASEURL = DEVMODE ? 'http://localhost:8001/' : 'https://quest.ms.mff.cuni.cz/testsuite/'
export { DEVMODE_ as DEVMODE, BASEURL }

import { WaiterControl as WaiterControlP2 } from "./waiter_p2/waiter_control"
import { WaiterControl as WaiterControlP1 } from "./waiter_p1/waiter_control";
import * as $ from 'jquery'

function validateAID(): string | undefined {
    let AID = $('#annotator_id').val() as string
    if (!(/^[a-zA-Z0-9\-]+$/.test(AID))) {
        alert('Invalid Annotator ID')
        return undefined
    }

    return AID
}

$('#start_annotation_p1').click(() => {
    let AID: string | undefined = validateAID()
    if (AID) {
        // Start the main routing
        new WaiterControlP1(AID, () => {
            $('#annotator_id').prop('disabled', true)
            $('#start_annotation_p1').hide()
            $('#start_annotation_p2').hide()
        })
    }
})

$('#start_annotation_p2').click(() => {
    let AID: string | undefined = validateAID()
    if (AID) {
        // Start the main routing
        new WaiterControlP2(AID, () => {
            $('#annotator_id').prop('disabled', true)
            $('#start_annotation_p1').hide()
            $('#start_annotation_p2').hide()
        })
    }
})

if (DEVMODE) {
    $('#annotator_id').val('testuser')
    // $('#start_annotation_p1').trigger('click')
    // $('#start_annotation_p2').trigger('click')
}