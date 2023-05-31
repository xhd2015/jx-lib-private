import { Dropdown, MenuProps } from "antd";
import { CSSProperties, ReactElement, useEffect, useState } from "react";
import { AiOutlineEllipsis } from "react-icons/ai";
import "./MenuWrapped.css";

export interface MenuWrappedProps {
    containerStyle?: CSSProperties
    containerClassName?: string

    menu?: MenuProps
    children?: any

    anchor?: ReactElement
}

export function MenuWrapped(props: MenuWrappedProps) {
    const [showMenu, setShowMenu] = useState(false)

    // TODO: support swipe left
    useEffect(() => {
        // // work only for PC
        // return setupSwipeLeftHandler(ref.current, x => {
        //     // console.log("x:", x)
        //     // left: x<0
        //     // right: x>0
        //     if (x < 0) {
        //         // left
        //         setShowMenu(true)
        //     } else if (x > 0) {
        //         // right
        //         setShowMenu(false)
        //     }
        // })
    }, [])

    return <div className={`position-relative ${props.containerClassName}`} onClick={() => setShowMenu(e => !e)}>
        {
            props.children
        }

        <Dropdown menu={props.menu}>
            <div
                className="menu"
                style={{ display: showMenu ? undefined : "none" }}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                {
                    props.anchor || <AiOutlineEllipsis />
                }

            </div>
        </Dropdown>
    </div>
}