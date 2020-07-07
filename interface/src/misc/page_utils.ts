import * as $ from 'jquery'
import { WaiterControlP2 } from '../waiter_p2/waiter_control'

export class PageUtils {
    public static syncval(): void {
        $('.synctext').each((index: number, element: HTMLElement) => {
            let element_text = $(`#${element.id}_text`)
            let type: string = element.getAttribute('type')
            let element_val = $(element)
            if (type == 'range') {
                element_val.on('input', () => {
                    element_text.text(element_val.val() as string)
                })
            } else if (type == 'checkbox') {
                element_val.on('input', () => {
                    element_text.text(element_val.prop('checked') ? 'Yes' : 'No')
                })
            }
        })
    }

    public static indeterminate(): void {
        $('.synctext[type="checkbox"]').each((index: number, element: HTMLElement) => {
            (element as HTMLInputElement).indeterminate = true
        })
    }

    public static syncmodelP2(controller: WaiterControlP2) {
        $('.synctext').each((index: number, element: HTMLElement) => {
            let element_val = $(element)

            let true_index: number = +element_val.attr('index')
            element_val.on('input', () => {
                if (element.id.endsWith('fluency')) {
                    controller.input_info('fluency', true_index, element_val.val() as number)
                } else if (element.id.endsWith('adequacy')) {
                    controller.input_info('adequacy', true_index, element_val.val() as number)
                } else if (element.id.endsWith('errors')) {
                    controller.input_info('errors', true_index, element_val.val() as string)
                } else if (element.id.endsWith('trans')) {
                    controller.input_info('translated', true_index, element_val.prop('checked') as boolean)
                }
            })
        })
    }
}