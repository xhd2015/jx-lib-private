
import { useCallback, useState, useMemo, useEffect } from "react"
import useCurrent from "./useCurrent"

export default function useVersionState<T>(v) {
    const [value, setValue] = useState(v)
    const [version, setVersion] = useState(1)
    const curVersion = useCurrent(version)

    // setVersionValue never changes
    const setVersionValue = useCallback((v: T) => {
        setValue(v)
        setVersion(curVersion.current + 1)
    }, [])
    const setValueNoUpdateVersion = setValue
    return [value, setVersionValue, version, setValueNoUpdateVersion]
}


export function useVersionStateMemo<T, V>(value: T, valueVersion: any, compute?: (value: T) => V): [state: V, setState: (state: V) => void] {
    const valueRef = useCurrent(value)
    const computeRef = useCurrent(compute)
    const valueMemo = useMemo(() => computeRef.current ? computeRef.current(valueRef.current) : valueRef.current, [valueVersion])
    const [state, setState] = useState(valueMemo)

    useEffect(() => {
        setState(valueMemo)
    }, [valueMemo])

    return [state as V, setState]
}