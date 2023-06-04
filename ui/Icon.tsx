import React from "react"
import { CSSProperties } from "react"

export interface IconProps {
    icon?: string | Function | any
    style?: CSSProperties
    className?: string
    onClick?: (e: Event) => void
}

export function Icon(props: IconProps) {
    return React.createElement(props.icon, { ...props, icon: undefined, style: { cursor: "pointer", ...props.style } })
}