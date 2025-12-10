import BaseResource from "@/resources/BaseResource";
import { EmployeeServices, User, ServiceCategory, Services } from "@prisma/client";

// Extended type including possible relations
export type ExtendedEmployeeService = EmployeeServices & {
  user?: User | null;
  category?: ServiceCategory | null;
  service?: Services | null;
};

export default class EmployeeServiceResource extends BaseResource<ExtendedEmployeeService> {
  async toArray(employeeService: ExtendedEmployeeService): Promise<Record<string, unknown>> {
    return {
      id: employeeService.id,
      slug: employeeService.slug,
      userId: employeeService.userId,
      user: employeeService.user
        ? {
            id: employeeService.user.id,
            name: employeeService.user.name,
            slug: employeeService.user.slug,
          }
        : null,

      serviceCategoryId: employeeService.serviceCategoryId,
      serviceCategoryTitle: employeeService.serviceCategoryTitle,

      category: employeeService.category
        ? {
            id: employeeService.category.id,
            title: employeeService.category.title,
            slug: employeeService.category.slug,
          }
        : null,

      serviceId: employeeService.serviceId,
      serviceTitle: employeeService.serviceTitle,

      service: employeeService.service
        ? {
            id: employeeService.service.id,
            title: employeeService.service.title,
            slug: employeeService.service.slug,
          }
        : null,

      servicePrice: employeeService.servicePrice,

      createdAt: employeeService.createdAt,
      updatedAt: employeeService.updatedAt,
      deletedAt: employeeService.deletedAt,
    };
  }

  async collection(records: ExtendedEmployeeService[]) {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
