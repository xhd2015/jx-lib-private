import { debounce } from "lodash";
import { useState, useMemo, useRef } from "react";

// NOTE: not responsive to wait, wait must be statically passed
export default function (initialValue: number, wait: number): [value: number, setValue: (e: number) => void, incrValue: (e: number) => void] {
    const valueRef = useRef(initialValue || 0)
    const [finalValue, setFinalValue] = useState(initialValue || 0)

    const [setValue, incrValue] = useMemo(() => {
        const setValue = debounce((e: number) => { valueRef.current = e; setFinalValue(valueRef.current) }, wait)
        const incrValue = (e: number) => {
            valueRef.current += e
            setValue(valueRef.current)
        }
        return [setValue, incrValue]
    }, [])
    return [
        finalValue,
        setValue,
        incrValue,
    ]
}