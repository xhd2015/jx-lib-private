import { useState, useCallback, useMemo } from "react"
import useCurrent from "./useCurrent"

export interface QueryData<T> {
    data: T
    refresh: () => Promise<void>
}
export function useQueryData<T>(load: () => Promise<T> | T, deps: any[]): QueryData<T> {
    const [data, setData] = useState<T>()

    const loadRef = useCurrent(load)
    const refresh = useCallback(async () => {
        const d = await loadRef?.current?.()
        setData(d)
    }, [])

    useMemo(() => {
        refresh()
    }, deps)

    return {
        data,
        refresh,
    }
}