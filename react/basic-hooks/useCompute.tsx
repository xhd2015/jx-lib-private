import { useEffect, useState } from "react"

export default function useCompute<T>(fn: () => T, deps: any[]): T | null {
    const [data, setData] = useState<T>()

    // initial value
    useEffect(() => {
        console.log("use compute init")
        setData(fn())
    }, [])

    // triggered upon deps change
    useEffect(() => {
        console.log("use compute dep change")
        setData(fn())
    }, deps)
    return data
}