export interface PaginatedResponse<T> {
    data: T[];
    links: any[];
}

export interface BaseSearchParams {
    orderBy: string;
    direction: 'ASC' | 'DESC';
    page?: number;
}
