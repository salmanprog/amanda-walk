import BaseResource from "@/resources/BaseResource";
import { User, UserRole, UserApiToken } from "@prisma/client";

// Extend User type to include relations
export type ExtendedUser = User & {
  userRole?: UserRole | null;
  apiTokens?: UserApiToken[];
};

export default class UserResource extends BaseResource<ExtendedUser> {
  async toArray(user: ExtendedUser): Promise<Record<string, unknown>> {
    return {
      id: user.id,
      slug: user.slug,
      name: user.name,
      email: user.email,
      userGroupId: user.userGroupId,
      mobileNumber: user.mobileNumber,
      emergencyname: user.emergencyname,
      emergencyNumber: user.emergencyNumber,
      referedBy: user.referedBy,
      vetName: user.vetName,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      country: user.country,
      totalTransaction: user.totalTransaction,
      payTransaction: user.payTransaction,
      remainingTransaction: user.remainingTransaction,
      total_transaction: user.totalTransaction,
      pay_transaction: user.payTransaction,
      remaining_transaction: user.remainingTransaction,
      imageUrl: user.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${user.imageUrl}`
        : null,
      // Include user role
      role: user.userRole
        ? {
            id: user.userRole.id,
            title: user.userRole.title,
            slug: user.userRole.slug,
          }
        : null,
      // Include API tokens
      apiTokens: user.apiTokens?.map((token) => ({
        id: token.id,
        apiToken: token.api_token,
        deviceType: token.device_type,
      })) ?? [],
    };
  }
}
