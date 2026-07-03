import { configureStore } from "@reduxjs/toolkit"
import authReducer from '../features/auth/auth.slice'
import themeReducer from '../features/theme/theme.slice'
import chatReducer from '../features/chat/chat.slice'
export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        chat: chatReducer,
    }
})