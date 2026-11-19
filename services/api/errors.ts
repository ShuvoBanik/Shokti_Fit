// Owner: Shared (led by Mahbub Hasnain) | shell
export class ApiError extends Error {
  status: number; // 0 = no network
  code: string;
  details?: { field: string; rule?: string }[];
  constructor(status: number, code: string, message: string, details?: { field: string; rule?: string }[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  get isNetwork() {
    return this.status === 0 || this.status >= 500;
  }
}
export const networkError = () => new ApiError(0, 'NETWORK_ERROR', 'No connection');
