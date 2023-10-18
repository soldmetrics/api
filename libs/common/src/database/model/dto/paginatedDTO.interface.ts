export interface PaginatedDTO<T> {
  totalElements: number;
  content: T[];
}
