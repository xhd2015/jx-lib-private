import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCurrent from "../react/basic-hooks/useCurrent";

export type Query<T> = (offset: number, limit: number, params?: { noTasking?: boolean }) => Promise<{ data: T[], count: number }>
export type QueryWithExtra<T, E> = (offset: number, limit: number, params?: { noTasking?: boolean }) => Promise<{ data: T[], count: number, extra: E }>


// deprecaed use PageOptions instead
export interface PaginationOptions extends PageOptions {
    initParam?: Object
}

export interface PageOptions {
    defaultPageSize?: number
    paramChangeDebounce?: number // ms
    initalRefresh?: boolean // default true
}

export interface PageResult<T> {
    data: T[]
    setData: (data: T[]) => void
    refresh: (params?: { noTasking?: boolean }) => Promise<void>
    loading: boolean


    // when param changed, should reset page to 1
    changePage: (page: number, pageSize: number) => void
    setPage: (page: number) => void
    setPageSize: (pageSize: number) => void
    pageSize: number
    page: number
    total: number
}

export interface PageResultWithExtra<T, E> extends PageResult<T> {
    extra: E
}

export function usePagedQuery<T>(api: Query<T>, opts?: PageOptions): PageResult<T> {
    return doUsePagedQuery<T, void>(api as QueryWithExtra<T, void>, opts)
}

export function usePagedQueryWithExtra<T, E>(api: QueryWithExtra<T, E>, opts?: PageOptions): PageResultWithExtra<T, E> {
    return doUsePagedQuery<T, E>(api, opts)
}
export function doUsePagedQuery<T, E>(api: QueryWithExtra<T, E>, opts?: PageOptions): PageResultWithExtra<T, E> {
    const [data, setData] = useState<T[]>()
    const [extra, setExtra] = useState<E>()

    const [pageSize, setPageSize] = useState(opts?.defaultPageSize)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)

    // exclusie lock
    const internLoading = useRef(false)

    const onPageChange = useCallback((page: number, pageSize: number) => {
        setPageSize(pageSize)
        setPage(page)
    }, [])


    const pageRef = useCurrent(page)
    const pageSizeRef = useCurrent(pageSize)
    const refresh = useCallback(async (params?: { noTasking?: boolean }) => {
        if (internLoading.current) {
            return
        }
        try {
            internLoading.current = true
            setLoading(true)
            const resp = await api((pageRef.current - 1) * pageSizeRef.current, pageSizeRef.current, params)
            setTotal(resp?.count)
            setData(resp?.data)
            setExtra(resp?.extra)
        } finally {
            setLoading(false)
            internLoading.current = false
        }
    }, [])

    const [total, setTotal] = useState(0)

    // trigger on init
    useEffect(() => {
        refresh()
    }, [page, pageSize])

    useMemo(() => {
        if (opts?.initalRefresh !== false) {
            refresh()
        }
    }, [])

    return {
        data,
        setData,
        refresh,
        changePage: onPageChange,
        loading,
        total,
        setPage,
        setPageSize,
        page,
        pageSize,
        extra,
    }
}