import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    const id = ref(0)
    const name = ref('')
    const username = ref('')
    const photo_url = ref('')
    const last_name = ref('')
    const language_code = ref('')
    const is_bot = ref(false)
    const is_premium = ref(false)

    return {
        id,
        name,
        username,
        photo_url,
        last_name,
        language_code,
        is_bot,
        is_premium
    }
}, { persist: true })
