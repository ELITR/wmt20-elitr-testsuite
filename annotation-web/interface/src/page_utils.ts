import * as $ from 'jquery'

export class PageUtils {
    public static syncval(): void {
        $('.synctext').each((index: number, element: HTMLElement) => {
            let element_text = $(`#${element.id}_text`)
            let type: string = element.getAttribute('type')
            let element_val = $(element)
            if (type == 'range') {
                $(element).on('change', () => {
                    element_text.text(element_val.val() as string)
                })
            } else if(type == 'checkbox') {
                $(element).on('change', () => {
                    element_text.text(element_val.prop('checked') ? 'Yes' : 'No')
                })
            }
            $(element).trigger('change')
        })
    }
}