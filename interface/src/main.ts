declare var DEVMODE: boolean;
var DEVMODE_: boolean = DEVMODE
var BASEURL = DEVMODE ? 'http://localhost:8001/' : 'https://quest.ms.mff.cuni.cz/testsuite/'
export { DEVMODE_ as DEVMODE, BASEURL }

import { WaiterControl as WaiterControlP2 } from "./waiter_p2/waiter_control"
import { WaiterControl as WaiterControlP1 } from "./waiter_p1/waiter_control";
import * as $ from 'jquery'

function validateAID() : string {
    let AIDEl = $('#annotator_id')
    
    let AID = AIDEl.val() as string
    if (!(/^[a-zA-Z0-9]+$/.test(AID))) {
        alert('Invalid Annotator ID')
        return undefined
    }

    AIDEl.prop('disabled', true)
    $('#start_annotation_p1').hide()
    $('#start_annotation_p2').hide()
    return AID
}

$('#start_annotation_p2').click(() => {
    let AID: string = validateAID()
    if(AID) {
        // Start the main routing
        new WaiterControlP2(AID)
    }
})

$('#start_annotation_p1').click(() => {
    let AID: string = validateAID()
    if(AID) {
        // Start the main routing
        new WaiterControlP1(AID)
    }
})

if (DEVMODE) {
    $('#annotator_id').val('testuser')
    // $('#start_annotation_p1').trigger('click')
   $('#start_annotation_p2').trigger('click')
}