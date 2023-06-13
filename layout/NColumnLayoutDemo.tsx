import { CSSProperties } from "react"
import { NColumnLayout } from "./NColumnLayout"


export interface NColumnLayoutDemoProps {
    style?: CSSProperties
    className?: string
}

export function NColumnLayoutDemo(props: NColumnLayoutDemoProps) {
    return <div className={props.className} style={props.style}>
        <NColumnLayout
            childrenMapping={{
                "a": <div>A</div>,
                "b": <div>B</div>,
                "c": <div>C</div>,
                "d": <div>D</div>,
            }}
        />
    </div>
}