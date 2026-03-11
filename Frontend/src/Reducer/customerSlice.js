import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    customer: {}
}

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        setProfile: (state, { payload }) => {
            state.customer = payload
        },
        clearValue: () => initialState,
    }
});

export const { setProfile , clearValue } = customerSlice.actions
export default customerSlice.reducer;