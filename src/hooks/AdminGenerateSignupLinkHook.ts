export default class AdminGenerateSignupLinkHook {
  static async indexQueryHook(
    query: any,
    _request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    query.orderBy = {
      createdAt: "desc",
    };
    return query;
  }

  static async showQueryHook(
    query: any,
    _request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  static async beforeCreateHook(data: any): Promise<any> {
    return data;
  }
}
