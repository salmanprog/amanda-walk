import BaseResource from "@/resources/BaseResource";
import { User, UserRole, UserApiToken, CmsModulePermission, CmModule } from "@prisma/client";

// Extend types to include nested relations
type CmModuleWithRelations = CmModule & {
  parent?: CmModule | null;
  children?: CmModule[];
};

type CmsModulePermissionWithModule = CmsModulePermission & {
  cmsModule: CmModuleWithRelations;
};

type UserRoleWithPermissions = UserRole & {
  modulePermissions?: CmsModulePermissionWithModule[];
};

// Extend User type to include relations
export type ExtendedUser = User & {
  userRole?: UserRoleWithPermissions | null;
  apiTokens?: UserApiToken[];
};

export default class AdminResource extends BaseResource<ExtendedUser> {
  // Helper function to format menu items hierarchically
  private formatMenuItems(permissions?: CmsModulePermissionWithModule[]): Record<string, unknown>[] {
    if (!permissions || permissions.length === 0) {
      return [];
    }
    const viewableModules = permissions.filter((perm) => {
      if (!perm) {
        return false;
      }
      
      if (!perm.cmsModule) {
        return false;
      }
      if (perm.deletedAt !== null && perm.deletedAt !== undefined) {
        return false;
      }
      if (perm.cmsModule.status === false) {
        return false;
      }
      if (perm.cmsModule.deletedAt !== null && perm.cmsModule.deletedAt !== undefined) {
        return false;
      }
      if (perm.isView === false) {
        return false;
      }
      return true;
    });

    if (viewableModules.length === 0) {
      return permissions.map(perm => ({
        id: perm.cmsModule?.id,
        name: perm.cmsModule?.name,
        routeName: perm.cmsModule?.routeName,
        icon: perm.cmsModule?.icon,
        status: perm.cmsModule?.status,
        deletedAt: perm.cmsModule?.deletedAt,
        parentId: perm.cmsModule?.parentId,
        isView: perm.isView,
        isAdd: perm.isAdd,
        isUpdate: perm.isUpdate,
        isDelete: perm.isDelete,
        permDeletedAt: perm.deletedAt,
        debug: "all_permissions_debug"
      })) as Record<string, unknown>[];
    }

    // Separate parent and child modules
    const parentModules = viewableModules.filter((perm) => !perm.cmsModule.parentId);
    const childModules = viewableModules.filter((perm) => perm.cmsModule.parentId);

    // Build menu structure
    const menu = parentModules.map((perm) => {
      const module = perm.cmsModule;
      const children = childModules
        .filter((childPerm) => childPerm.cmsModule.parentId === module.id)
        .map((childPerm) => ({
          id: childPerm.cmsModule.id,
          name: childPerm.cmsModule.name,
          routeName: childPerm.cmsModule.routeName,
          icon: childPerm.cmsModule.icon,
          sortOrder: childPerm.cmsModule.sortOrder,
          permissions: {
            isAdd: childPerm.isAdd,
            isView: childPerm.isView,
            isUpdate: childPerm.isUpdate,
            isDelete: childPerm.isDelete,
          },
        }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      return {
        id: module.id,
        name: module.name,
        routeName: module.routeName,
        icon: module.icon,
        sortOrder: module.sortOrder,
        permissions: {
          isAdd: perm.isAdd,
          isView: perm.isView,
          isUpdate: perm.isUpdate,
          isDelete: perm.isDelete,
        },
        children: children.length > 0 ? children : undefined,
      };
    });

    // Sort by sortOrder
    return menu.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async toArray(user: ExtendedUser): Promise<Record<string, unknown>> {
    let menuPermissions = user.userRole?.modulePermissions;
    if (!menuPermissions || menuPermissions.length === 0) {
      const { prisma } = await import("@/lib/prisma");
      try {
        const roleWithPermissions = await prisma.userRole.findUnique({
          where: { id: user.userRole?.id },
          include: {
            modulePermissions: {
              include: {
                cmsModule: {
                  include: {
                    parent: true,
                    children: true,
                  },
                },
              },
            },
          },
        });
        if (roleWithPermissions && 'modulePermissions' in roleWithPermissions) {
          const filteredPermissions = (roleWithPermissions.modulePermissions as CmsModulePermissionWithModule[]).filter(
            (perm) => 
              !perm.deletedAt && 
              perm.cmsModule && 
              perm.cmsModule.status && 
              !perm.cmsModule.deletedAt
          );
          menuPermissions = filteredPermissions;
        } else {
        }
      } catch (error) {
      }
    }
    return {
      id: user.id,
      slug: user.slug,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
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
      // Include menu with permissions
      menu: menuPermissions && menuPermissions.length > 0
        ? this.formatMenuItems(menuPermissions)
        : [],
    };
  }
}
