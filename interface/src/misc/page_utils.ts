import * as $ from 'jquery'
import { WaiterControl as WaiterControlP2 } from '../waiter_p2/waiter_control'
import { WaiterControl as WaiterControlP1 } from '../waiter_p1/waiter_control'

export class PageUtils {
    public static syncval(): void {
        $('.synctext').each((index: number, element: HTMLElement) => {
            let element_text = $(`#${element.id}_text`)
            let type: string = element.getAttribute('type') as string
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
        PageUtils.indeterminate()
    }

    private static indeterminate(): void {
        $('.synctext[type="checkbox"]').each((index: number, element: HTMLElement) => {
            (element as HTMLInputElement).indeterminate = true
        })
    }

    public static listenModelP1(controller: WaiterControlP1) {
        $('.synctext').each((index: number, element: HTMLElement) => {
            let element_val = $(element)

            let true_index: number = +(element_val.attr('index')!)
            element_val.on('input', () => {
                if (element.id.endsWith('adequacy')) {
                    controller.input_info('adequacy', true_index, element_val.val() as number)
                } else if (element.id.endsWith('fluency')) {
                    controller.input_info('fluency', true_index, element_val.val() as number)
                } else if (element.id.endsWith('errors')) {
                    controller.input_info('errors', true_index, element_val.val() as string)
                } else if (element.id.endsWith('nonconf')) {
                    controller.input_info('nonconf', true_index, element_val.prop('checked') as boolean)
                }
            })

            if (element_val.attr('trigger') != undefined) {
                element_val.trigger('input')
            }
        })
    }

    public static listenModelP2(controller: WaiterControlP2) {
        $('.synctext').each((index: number, element: HTMLElement) => {
            let element_val = $(element)

            let true_index: number = +(element_val.attr('index')!)
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

            if (element_val.attr('trigger') != undefined) {
                element_val.trigger('input')
            }
        })
    }

    public static scrollIntoViewP1() {
        // $('.waiter_highlight_markable').get(0).scrollIntoView(false)
        // $('#src_snip_p1').scrollTop($('#src_snip_p1').scrollTop()! + 150)

        $('.waiter_highlight_line').each(
            (index: number, element: HTMLElement) => {
                element.scrollIntoView(false)
                let parentEl = $(element.parentElement!)
                if (parentEl.scrollTop()! > 0)
                    parentEl.scrollTop(parentEl.scrollTop()! + 100)
            }
        )
    }

    public static scrollIntoViewP2() {
        // $('.waiter_highlight_markable').get(0).scrollIntoView(false)
        // $('#src_snip_p2').scrollTop($('#src_snip_p2').scrollTop()! + 150)

        $('.waiter_highlight_line').each(
            (index: number, element: HTMLElement) => {
                element.scrollIntoView(false)
                let parentEl = $(element.parentElement!)
                if (parentEl.scrollTop()! > 0)
                    parentEl.scrollTop(parentEl.scrollTop()! + 100)
            }
        )
    }
}