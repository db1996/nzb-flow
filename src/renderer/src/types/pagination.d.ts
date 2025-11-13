export interface PaginationLink {
    url: string | URL
    label: string
    active: boolean
}

export interface Paginated<T> {
    data: T[]
    currentPage: number
    from: number | null
    lastPage: number
    perPage: number
    to: number | null
    total: number
    links: PaginationLink[]
}
