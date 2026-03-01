export type APISuccess<T> = {
    success: true;
    data: T;
};

export type APIError<E> = {
    success: false;
    error: E;
};

export type APIResponse<T, E> = APISuccess<T> | APIError<E>;