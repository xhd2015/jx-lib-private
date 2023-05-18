

// dialog
export interface ShowDialogProps {
    title?: string
    children?: any
    cancelLabel?: string
    confirmLabel?: string
    confirmingLabel?: string
    onCancel?: () => any
    onConfirm?: () => any
}

let _showDialog: (opts: ShowDialogProps) => any
export function setShowDialog(showDialog: (opts: ShowDialogProps) => any) {
    _showDialog = showDialog
}

export function showDialog(opts: ShowDialogProps) {
    if (!_showDialog) {
        console.log("showDialog not set:", opts)
        return
    }
    return _showDialog(opts)
}