import useCurrent from "../react/basic-hooks/useCurrent";
import { attachMouseEvents } from "../resize/mouse";
import { CSSProperties, ReactElement, useEffect, useMemo, useRef, useState } from "react";

export interface NColumnLayoutProps {
    style?: CSSProperties
    className?: string

    childrenMapping?: { [key: string]: ReactElement }
    initialSettings?: { [key: string]: Settings }
}
interface Settings {
    width?: string
}

interface Column {
    key: string
    area: string
    role: "child" | "dragBar"
    index: number

    childElement?: ReactElement
    settings?: Settings
}

function makeColumns(childrenMapping: { [key: string]: ReactElement }, initialSettings?: { [key: string]: Settings }): Column[] {
    if (!childrenMapping) {
        return []
    }
    const areas: Column[] = []
    const entries = Object.entries(childrenMapping)
    const n = entries.length
    let i = 0
    for (let i = 0; i < n; i++) {
        const [k, v] = entries[i]
        areas.push({
            key: k,
            area: `child_${i}`,
            role: "child",
            index: i,
            childElement: v,
            settings: initialSettings?.[k]
        })

        if (i < n - 1) {
            areas.push({
                key: `dragBar_${i}`,
                area: `dragBar_${i}`,
                role: "dragBar",
                index: i,
            })
        }
    }
    return areas
}


function stepUp() {

}
// column resize: https://codepen.io/lukerazor/pen/GVBMZK
export function NColumnLayout(props: NColumnLayoutProps) {
    const templateAreas = useMemo(() => makeColumns(props.childrenMapping, props.initialSettings), [])

    const initialCols = useMemo(() => {
        return templateAreas.map(e => {
            if (e.role === "dragBar") {
                return "2px"
            }
            return e.settings?.width
        }).map(e => e || "1fr").join(" ")
    }, [templateAreas])

    const [templateCols, setTemplateCols] = useState(initialCols)

    const rootRef = useRef<HTMLDivElement>()

    return <div
        ref={rootRef}
        style={{
            display: "grid",
            gridTemplateAreas: `"${templateAreas.map(e => e.area).join(" ")}"`,
            gridTemplateColumns: templateCols,
            gridTemplateRows: "100%",
            ...props.style
        }}
        className={props.className}
    >
        {
            templateAreas.map((e, i) => {
                if (e.role === "child") {
                    return <RenderColumn style={{ gridArea: e.area }} key={e.area}>{e.childElement}</RenderColumn>
                }
                return <DragBar
                    selfIndex={i}
                    style={{ gridArea: e.area, cursor: "col-resize" }}
                    key={e.area}
                    getSiblings={() => {
                        if (!rootRef.current) {
                            return []
                        }
                        const items = []
                        for (let j = 0; j < rootRef.current.children.length; j++) {
                            items.push(rootRef.current.children[j])
                        }
                        return items
                    }}
                    setSiblingsWidth={widths => {
                        const templateCols = widths.map(e => `${e}px`).join(" ")
                        setTemplateCols(templateCols)
                    }}
                ></DragBar>
            })
        }
    </div>
}

export interface RenderColumnProps {
    style?: CSSProperties
    className?: string
    onRef?: (e: HTMLDivElement) => void

    children?: ReactElement | ReactElement[]
}

function RenderColumn(props: RenderColumnProps) {
    const ref = useRef<HTMLDivElement>()
    useEffect(() => {
        props.onRef?.(ref.current)
    }, [])

    return <div ref={ref}
        style={props.style}
        className={props.className}
    >
        {props.children}
    </div>
}

interface DragBarProps {
    style?: CSSProperties
    className?: string
    onRef?: (e: HTMLDivElement) => void

    selfIndex?: number
    getSiblings?: () => HTMLDivElement[]
    setSiblingsWidth?: (widths: number[]) => void
}
function DragBar(props: DragBarProps) {
    const ref = useRef<HTMLDivElement>()


    const propsRef = useCurrent(props)
    useEffect(() => {
        if (props.onRef) {
            props.onRef(ref.current)
        }
        let pageX: number
        let widths: number[]

        let savedUserSelect

        const getWidth = (e: HTMLElement): number => {
            return e.getBoundingClientRect().width
        }
        return attachMouseEvents(ref.current, {
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

                const siblings = propsRef.current?.getSiblings?.()
                widths = siblings.map(e => getWidth(e))
            },
            onMouseMove(e) {
                const diff = e.pageX - pageX
                const newWidths = [...widths]

                const selfIndex = propsRef.current.selfIndex
                if (selfIndex > 0) {
                    newWidths[propsRef.current.selfIndex - 1] += diff
                }
                if (selfIndex + 1 < newWidths.length) {
                    newWidths[propsRef.current.selfIndex + 1] -= diff
                }

                propsRef.current.setSiblingsWidth?.(newWidths)
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

    return <div
        style={props.style}
        className={props.className}
        ref={ref}
    >
    </div>
}