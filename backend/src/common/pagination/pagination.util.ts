export function buildPagination(page: number, limit: number) {
  const take = limit;
  const skip = (page - 1) * limit;
  return { take, skip };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
  };
}
