import { useEffect, useRef, useState } from "react"



// data=1, ref.current = undefined, capture data = 1
// setData(2) => data = 2, ref.current = previous capture data = 1, capture data = 2

export default function <T>(initial?: T): [T, (t: T) => void, T] {
    const [data, setData] = useState<T>(initial)

    const ref = useRef<T>()
    useEffect(() => {
        ref.current = data
    }, [data])

    return [data, setData, ref.current]
}