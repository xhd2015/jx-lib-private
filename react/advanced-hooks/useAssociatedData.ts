


// a collection of data, id, 

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useCurrent from "../basic-hooks/useCurrent"

// fetch the remainings with batch query

export interface AssociateOptions<T, E> {
    // deprecated
    sourceIDField?: string
    // deprecated
    resultIDField?: string

    sourceID?: (e: E) => string | number
    resultID?: (e: T) => string | number

    showRefresh?: () => boolean | any // boolean like
    deps?: any[]
}

export function useMultiAssociatedData<T, E>(sourceData: E[], fetchData: (ids: string[]) => Promise<T[]>, opts?: AssociateOptions<T, E>): { [id: string]: T[] } {
    return doUseAssociatedData(sourceData, fetchData, opts, true) as { [id: string]: T[] }
}

export function useAssociatedData<T, E>(sourceData: E[], fetchData: (ids: string[]) => Promise<T[]>, opts?: AssociateOptions<T, E>): { [id: string]: T } {
    return doUseAssociatedData(sourceData, fetchData, opts, false) as { [id: string]: T }
}

function doUseAssociatedData<T, E>(sourceData: E[], fetchData: (ids: string[]) => Promise<T[]>, opts: AssociateOptions<T, E> | undefined, multiple: boolean): { [id: string]: (T | T[]) } {
    const dataMapping = useRef({
        ids: {},
        value: {}, // non-nil values
    })
    const [loadVersion, setLoadVersion] = useState(0)

    const takeSourceID = useCallback((e: E) => opts?.sourceID ? opts?.sourceID(e) : e?.[opts?.sourceIDField || 'id'], [opts?.sourceID, opts?.sourceIDField])
    const takeResultID = useCallback((e: T) => opts?.resultID ? opts?.resultID(e) : e?.[opts?.resultIDField || 'id'], [opts?.resultID, opts?.resultIDField])

    const takeSourceIDRef = useCurrent(takeSourceID)
    const takeResultIDRef = useCurrent(takeResultID)

    const loadVersionRef = useCurrent(loadVersion)
    const fetchDataRef = useCurrent(fetchData)
    const showRefreshRef = useCurrent(opts?.showRefresh)
    useEffect(() => {
        if (showRefreshRef?.current && !showRefreshRef?.current()) {
            return
        }
        const idMapping = {}
        sourceData?.forEach?.(e => {
            const id = takeSourceIDRef.current?.(e)
            if (id && !(id in dataMapping.current.ids)) {
                dataMapping.current.ids[id] = undefined
                idMapping[id] = true
            }
        })

        const ids = Object.keys(idMapping)
        if (ids?.length > 0) {
            fetchDataRef?.current?.(ids)?.then?.(resList => {
                resList?.forEach?.(e => {
                    const mappingID = takeResultIDRef.current?.(e)
                    if (mappingID && (mappingID in dataMapping.current.ids)) {
                        if (multiple) {
                            dataMapping.current.value[mappingID] = dataMapping.current.value[mappingID] || []
                            dataMapping.current.value[mappingID].push(e)
                        } else {
                            dataMapping.current.value[mappingID] = e
                        }
                    }
                })

                // change
                dataMapping.current.value = { ...dataMapping.current.value }
                setLoadVersion(loadVersionRef.current + 1)
            })
        }
    }, [sourceData, ...(opts?.deps || [])])

    return dataMapping.current.value
}