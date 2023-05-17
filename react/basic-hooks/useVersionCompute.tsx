import { useState, useMemo, useEffect } from "react"
import useCurrent from "./useCurrent"

// deprecated
export default function useVersionCompute<T, V>(value: T, valueVersion: any, compute?: (value: T) => V): [state: V, setState: (state: V) => void] {
    const valueRef = useCurrent(value)
    const computeRef = useCurrent(compute)
    const valueMemo = useMemo(() => computeRef.current ? computeRef.current(valueRef.current) : valueRef.current, [valueVersion])
    const [state, setState] = useState(valueMemo)

    useEffect(() => {
        setState(valueMemo)
    }, [valueMemo])

    return [state as V, setState]
}