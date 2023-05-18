import { showError } from "."
import { addTask } from "./tasking"
import voca from "voca"
import { deepKeyConvert } from "@fultonjs/common/src/object"


export type ReuestOptions = RequestInit & {
    // filter response, after validated
    filterResp?: (resp: any) => any
    noTasking?: boolean
    jsonBodyUnwrapped?: boolean
    params?: any
}

export type RequestHook = (url: string, options?: ReuestOptions) => [url: string, options?: ReuestOptions]
export type ResponseHook = (resp: any, url: string, options?: ReuestOptions) => any

const reqHooks: RequestHook[] = []
export function addRequestHook(hook: RequestHook) {
    if (!hook) {
        throw new Error("requires hook")
    }
    reqHooks.push(hook)
}

const respHooks: ResponseHook[] = []
export function addResponseHook(hook: ResponseHook) {
    if (!hook) {
        throw new Error("requires hook")
    }
    respHooks.push(hook)
}

// request: auto show error message, and add to task
export function request(url: string, options?: ReuestOptions): Promise<any> {
    reqHooks.forEach(hook => {
        [url, options] = hook(url, options)
    })
    if (options?.body && typeof options?.body !== 'string') {
        options = { ...options, body: JSON.stringify(options?.body) }
    }
    // server has a bug: for post if body is null or empty,
    // it sets content-length to 0, causing server reading error.
    if (options?.method === 'post' && !options?.body) {
        options = { ...options, body: "{}" }
    }
    if (options?.params && typeof options?.params !== 'string') {
        options = { ...options, params: new URLSearchParams(options?.params).toString() }
    }
    if (options?.params) {
        url = url + "?" + options?.params
    }
    return new Promise((resolve, reject) => {
        // console.log("making request get:", url)
        const task = fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
            }
        }).then(async (e) => {
            if (e.status !== 200) {
                console.log("status not 200:", e.status)
                // reject
                const txt = e.text()
                txt.then(text => {
                    console.log("txt response:", text)
                    reject(new Error(text))
                })
                txt.catch(reject)
                return
            }
            // parse json
            if (!((options as any)?.disableResJSON)) {
                const jsn = e.json()
                jsn.catch(reject)
                jsn.then((jsonData: any) => {
                    if (!options?.jsonBodyUnwrapped && jsonData.code != 0) {
                        // console.log("json msg:", jsonData)
                        if (jsonData.code === 401) {
                            location.href = "/login"
                            return
                        }
                        reject(new Error(jsonData.msg))
                        return
                    }
                    let data = options?.jsonBodyUnwrapped ? jsonData : jsonData.data
                    respHooks.forEach(hook => {
                        data = hook(data, url, options)
                    })
                    if (options.filterResp) {
                        data = options.filterResp({ ...jsonData, data })
                    }
                    // console.log("resolve response:", jsonData.data)
                    resolve(data)
                })
            }
        })

        // mark task spinning
        if (!options?.noTasking) {
            addTask(task)
        }

        task.catch(e => {
            showError(e)
            reject(e)
        })
    })
}
export function postJSON(url: string, body: Object, options?: ReuestOptions): Promise<any> {
    return request(url, {
        method: 'post',
        body: body as any,
        headers: {
            // ...(body && { "Content-Type": "application/json" }),
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    })
}
export function get(url: string, params?: string | Record<string, string>, options?: ReuestOptions): Promise<any> {
    return request(url, {
        method: 'get',
        params: params,
        ...options
    })
}

export enum CaseMode {
    UpperCamelCase,
    LowerCamelCase,
    SnakeCase,
}

export function reqCaseConvertHook(mode: CaseMode): RequestHook {
    return (url: string, options?: ReuestOptions): [url: string, options?: ReuestOptions] => {
        if (options?.body && typeof options.body === 'object') {
            // array or object
            options = { ...options, body: convertKeyObjectOrArray(options.body, (s) => convert(s, mode)) }
        }
        if (options?.params && typeof options.params === 'object') {
            // array or object
            options = { ...options, params: convertKeyObjectOrArray(options.params, (s) => convert(s, mode)) }
        }
        return [url, options]
    }
}
export function respCaseConvertHook(mode: CaseMode): ResponseHook {
    return (data: any) => {
        if (data && typeof data === 'object') {
            data = convertKeyObjectOrArray(data, s => convert(s, mode))
        }
        return data
    }
}

// should we deep?
export function convertKeyObjectOrArray<T>(e: T, convert: (s: string) => string): T {
    if (!e) {
        return e
    }
    if (typeof e !== "object") {
        return e
    }
    return deepKeyConvert(e, convert)
    // const convObj = (o: any) => {
    //     if (!o) {
    //         return o
    //     }
    //     const o2 = {}
    //     Object.keys(o).forEach(k => o2[convert(k)] = o[k])
    //     return o2
    // }
    // if (Array.isArray(e)) {
    //     return e.map(convObj) as T
    // }
    // return convObj(e)
}

export function convertObjectOrArrKey<T>(o: T, convert: (s: string) => string): T {
    if (!o || typeof o !== "object") {
        return o
    }
    if (Array.isArray(o)) {
        return o.map(e => convertObjectKey(e, convert)) as T
    }
    return convertObjectKey(o, convert)
}
export function convertObjectKey<T>(o: T, convert: (s: string) => string): T {
    if (!o || typeof o !== "object" || Array.isArray(o)) {
        return o
    }
    const e: T = {} as T
    Object.keys(o).forEach(k => e[convert(k)] = o[k])
    return e
}

export function convert(s: string, mode: CaseMode): string {
    if (!s) {
        return ""
    }
    switch (mode) {
        case CaseMode.UpperCamelCase:
            return voca.capitalize(voca.camelCase(s))
        case CaseMode.LowerCamelCase:
            return voca.camelCase(s)
        case CaseMode.SnakeCase:
            return voca.snakeCase(s)
        default:
            throw new Error(`unrecognized mode:${mode}`)
    }
}