export default class AdminTransactionHook {
  static async indexQueryHook(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    query.orderBy = { createdAt: "desc" };
    return query;
  }

  static async showQueryHook(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    return query;
  }

  static async beforeCreateHook(
    query: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return query;
  }
}
