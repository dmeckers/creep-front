import type { DirectiveBinding } from "vue"

const rippleDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const color = binding.value === undefined ? '#fff' : binding.value

        el.style.position = 'relative'
        el.style.overflow = 'hidden'

        const handler = (ev: MouseEvent) => {
            const circle = document.createElement('div')
            const rect = el.getBoundingClientRect()
            const x = ev.clientX - rect.left
            const y = ev.clientY - rect.top

            circle.setAttribute(
                'style',
                `
                    background: ${color};
                    width: 10px;
                    height: 10px;
                    opacity: 0;
                    border-radius: 100em;
                    position: absolute;
                    top: ${y}px;
                    left: ${x}px;
                    pointer-events: none;
                    animation: anka-ripple 0.4s 1 ease-in-out;
                `
            )

            el.appendChild(circle)
            ev.stopPropagation()

            setTimeout(() => {
                if (circle.parentNode) {
                    circle.parentNode.removeChild(circle)
                }
            }, 400)
        }

        el.__rippleHandler__ = handler
        el.addEventListener('click', handler)
    },
    unmounted(el: HTMLElement) {
        if (el.__rippleHandler__) {
            el.removeEventListener('click', el.__rippleHandler__)
            delete el.__rippleHandler__
        }
    }
}

// Add a type for the custom property
declare global {
    interface HTMLElement {
        __rippleHandler__?: (ev: MouseEvent) => void
    }
}

export default rippleDirective