

// message
export interface Message {
    id?: number
    duration?: number
    render?: () => any
    variant?: '' | 'success' | 'error'
    title: string
    content: string
}


let _showMessage: (msg: Message) => any
export function setShowMessage(showMessage: (msg: Message) => any) {
    _showMessage = showMessage
}


// Demo
// useEffect(() => {
//     showMessage({
//       title: "haha",
//       content: "shit"
//     })

//     setTimeout(() => showError("shit"), 1000)
//   }, [])


export function showMessage(msg: Message) {
    if (!_showMessage) {
        console.log("showMessage not set:", msg)
        return
    }
    return _showMessage(msg)
}

export function showError(e: Error | string) {
    showMessage({
        title: 'Error',
        variant: 'error',
        content: (e as Error)?.message || (e as string),
    })
}

export function installDefaultErrHandler() {
    // console.log("inject on error");
    // these two are global unhandled errors
    window.onerror = function (msg, url, line, col, err) {
        // console.log("onerror:", msg);
        console.log("on error:", msg, err)
        if (msg === 'ResizeObserver loop limit exceeded' && !err) {
            // can safely ignore this error: https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
            return
        } else if (typeof msg === 'string' && !err && msg.startsWith("ResizeObserver loop completed with")) {
            // see https://github.com/xhd2015/lifelog-private/issues/94
            return
        }
        if (msg === 'Script error.' && !err) {
            // this happens on iOS chrome & safari
            return
        }
        showError(msg + "," + err?.message);
        //code to handle or report error goes here
    };

    window.addEventListener("unhandledrejection", function (event) {
        console.log("on unhandledrejection:", event)
        const err = event.reason;
        if (err) {
            showError(err.message);
        }
        //handle error here
        //event.promise contains the promise object
        //event.reason contains the reason for the rejection
    });
}