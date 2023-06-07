import { useEffect, useState } from "react";

export function useAsyncMemo<T>(fn: () => Promise<T>, deps: Array<any>): T {
    const [version] = useState({ current: 0 })
    const [val, setVal] = useState<T>()

    useEffect(() => {
        // TODO: may cancel last operation
        version.current++
        const memoVersion = version.current
        fn().then(v => {
            // the last operation wins
            if (version.current === memoVersion) {
                setVal(v)
            }
        })
    }, deps)

    return val
}