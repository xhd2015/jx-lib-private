


let _addTask: (task: Promise<any>) => Promise<any>
export function setAddTask(addTask: (task: Promise<any>) => Promise<any>) {
    _addTask = addTask
}
// task spinning
export function addTask<T>(task: Promise<T>): Promise<T> {
    if (!_addTask) {
        return task
    }
    return _addTask(task)
}