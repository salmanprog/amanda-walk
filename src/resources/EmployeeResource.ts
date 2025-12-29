import BaseResource from "@/resources/BaseResource";
import { User, UserRole, UserApiToken, EmployeeServices } from "@prisma/client";

// Extend User type to include relations
export type ExtendedEmployee = User & {
  userRole?: UserRole | null;
  apiTokens?: UserApiToken[];
  employeeservices?: EmployeeServices[];
};

export default class EmployeeResource extends BaseResource<ExtendedEmployee> {
  async toArray(employee: ExtendedEmployee): Promise<Record<string, unknown>> {
    return {
      id: employee.id,
      slug: employee.slug,
      name: employee.name,
      email: employee.email,
      mobileNumber: employee.mobileNumber,
      imageUrl: employee.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${employee.imageUrl}`
        : null,
      // Include user role
      role: employee.userRole
        ? {
            id: employee.userRole.id,
            title: employee.userRole.title,
            slug: employee.userRole.slug,
          }
        : null,
      // Include API tokens
      apiTokens: employee.apiTokens?.map((token) => ({
        id: token.id,
        apiToken: token.api_token,
        deviceType: token.device_type,
      })) ?? [],
      employeeservices: employee.employeeservices?.map((service) => ({
        id: service.id,
        slug: service.slug,
        serviceCategoryId: service.serviceCategoryId,
        serviceId: service.serviceId,
        serviceCategoryTitle: service.serviceCategoryTitle,
        serviceTitle: service.serviceTitle,
        servicePrice: service.servicePrice,
      })) ?? [],
    };
  }
}
