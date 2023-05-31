import { message } from "antd"
import { setShowMessage, Message, setAddTask } from "../system"

export function initProvider() {
    setShowMessage((msg: Message): any => {
        if (msg.variant === 'error') {
            message.error(msg.content, (msg.duration / 1000) || 5)
            return
        }
        message.info(msg.content, (msg.duration / 1000) || 5)
    })

    let taskCnt = 0
    let close
    setAddTask((task: Promise<any>): Promise<any> => {
        taskCnt++
        if (taskCnt === 1) {
            close = message.loading({ content: "loading", key: "loading_message", duration: 0 })
        }

        task.finally(() => {
            taskCnt--
            if (taskCnt === 0) {
                // message.destroy("loading_message")
                close()
                close = undefined
            }
        })
        return task
    })
}