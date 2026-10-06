import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    duration: '0',
    transfer: {Rx: [0, 'B'], Tx: [0, 'B']},
    connectivity: false
}

export const variableSlice = createSlice({
    name: 'variable',
    initialState,
    reducers: {
        updateDuration: (state, action) => {
            state.duration = action.payload
        },
        updateTransfer: (state, action) => {
            state.transfer = {
                Rx: action.payload.Rx,
                Tx: action.payload.Tx
            }
        },
        updateConnectivity: (state, action) => {
            state.connectivity = action.payload
        }
    }
})

export const { updateDuration, updateTransfer, updateConnectivity } = variableSlice.actions
export default variableSlice.reducer