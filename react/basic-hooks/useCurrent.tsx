import { useState } from "react"


export default function <T>(v: T): { current: T } {
    const [ref] = useState({ current: v })
    ref.current = v
    return ref
}