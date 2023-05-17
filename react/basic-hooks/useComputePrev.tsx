import { useEffect, useRef, useState } from "react"

// data=1, ref.current = undefined, capture data = 1
// setData(2) => data = 2, ref.current = previous capture data = 1, capture data = 2
export default function <T>(fn: () => T, deps: any[]): [T | null, T | null] {
    const [data, setData] = useState<T>(fn())
    const ref = useRef<T>()

    useEffect(() => {
        const newData = fn()
        setData(newData)
        ref.current = data // capture the old data
    }, deps)

    return [data, ref.current]
}