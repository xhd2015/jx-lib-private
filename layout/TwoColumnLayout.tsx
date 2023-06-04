import { attachMouseEvents } from "../resize/mouse";
import { CSSProperties, ReactElement, useEffect, useRef, useState } from "react";

export interface TwoColumnLayoutProps {
    style?: CSSProperties
    className?: string

    left?: ReactElement
    right?: ReactElement

    initialLeftWidth?: string
}

// column resize: https://codepen.io/lukerazor/pen/GVBMZK
export function TwoColumnLayout(props: TwoColumnLayoutProps) {
    const [templateCols, setTemplateCols] = useState(`${props.initialLeftWidth || "200px"} 2px 1fr`)

    const leftRef = useRef<HTMLDivElement>()
    const resizeBarRef = useRef<HTMLDivElement>()
    const rightRef = useRef<HTMLDivElement>()

    useEffect(() => {
        let pageX: number
        let widths: number[]

        let savedUserSelect

        const getWidth = (e: HTMLElement): number => {
            return e.getBoundingClientRect().width
        }
        return attachMouseEvents(resizeBarRef.current, {
            onMouseOver(e) {
                e.target.style.borderRight = "2px solid #40a9ff"
            },
            onMouseOut(e) {
                e.target.style.borderRight = ""
            },
            onMouseDown(e) {
                pageX = e.pageX
                document.body.style.userSelect = savedUserSelect
                document.body.style.userSelect = "none"

                widths = [getWidth(leftRef.current), getWidth(resizeBarRef.current), getWidth(rightRef.current)]
            },
            onMouseMove(e) {
                const diff = e.pageX - pageX
                const newWidths = [...widths]
                newWidths[0] += diff
                newWidths[2] -= diff

                const templateCols = newWidths.map(e => `${e}px`).join(" ")
                setTemplateCols(templateCols)
            },
            onMouseUp(e) {
                let val = savedUserSelect
                if (val === undefined) {
                    val = "initial"
                }
                document.body.style.userSelect = val

            },
        })
    }, [])

    return <div style={{
        display: "grid",
        gridTemplateAreas: `"left dragBar right"`,
        gridTemplateColumns: templateCols,
        gridTemplateRows: "100%",
        ...props.style
    }}
        className={props.className}
    >

        <div style={{ gridArea: "left", resize: "horizontal" }} ref={leftRef}>
            {props.left}
        </div>
        <div style={{ gridArea: "dragBar", cursor: "col-resize" }} ref={resizeBarRef}></div>
        <div style={{ gridArea: "right", border: "1px solid green" }} ref={rightRef}>
            {props.right}
        </div>
    </div>
}
