import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  // Create User Roles
  const superAdminRole = await prisma.userRole.upsert({
    where: { slug: "super-admin" },
    update: {},
    create: {
      title: "Super Administrator",
      slug: "super-admin",
      description: "Super admin access",
      type: "SUPER_ADMIN",
      isSuperAdmin: true,
      status: true,
    },
  });

  const adminRole = await prisma.userRole.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      title: "Admin",
      slug: "admin",
      description: "Admin access",
      type: "ADMIN",
      isSuperAdmin: false,
      status: true,
    },
  });

  const clientRole = await prisma.userRole.upsert({
    where: { slug: "employee" },
    update: {},
    create: {
      title: "Employee",
      slug: "employee",
      description: "Employee access",
      type: "EMPLOYEE",
      isSuperAdmin: false,
      status: true,
    },
  });

  const userRole = await prisma.userRole.upsert({
    where: { slug: "user" },
    update: {},
    create: {
      title: "User",
      slug: "user",
      description: "Regular user access",
      type: "USER",
      isSuperAdmin: false,
      status: true,
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "superadmin@amanda.com" },
    update: {},
    create: {
      name: "Super Admin",
      username: "superadmin",
      slug: "super-admin",
      email: "superadmin@amanda.com",
      password: hashedPassword,
      userGroupId: superAdminRole.id,
      userType: "SUPER_ADMIN",
      gender: "MALE",
      profileType: "PUBLIC",
      status: true,
      isEmailVerify: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@amanda.com" },
    update: {},
    create: {
      name: "Admin",
      username: "admin",
      slug: "admin",
      email: "admin@amanda.com",
      password: hashedPassword,
      userGroupId: adminRole.id,
      userType: "ADMIN",
      gender: "MALE",
      profileType: "PUBLIC",
      status: true,
      isEmailVerify: true,
    },
  });

  const servicesCategories = [
    {
      title: "Dog Walk",
      slug: "dog-walk",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      imageUrl: "",
      seoTitle: "Dog Walk",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    }
  ];
  
  for (const category of servicesCategories) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        title: category.title,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        status: true,
      },
    });
  }
  
  const services = [
    {
      title: "15 Min Dog Walk AM",
      slug: "15-min-dog-walk-am",
      userId: 1,
      servicesCategoryId: 1,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      mints: "15",
      imageUrl: "",
      seoTitle: "15 Min Dog Walk AM",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      price: 10,
      status: true,
    },
    {
      title: "20 Min Dog Walk AM",
      slug: "20-min-dog-walk-am",
      userId: 1,
      servicesCategoryId: 1,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      mints: "20",
      imageUrl: "",
      seoTitle: "20 Min Dog Walk AM",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      price: 15,
      status: true,
    },
    {
      title: "30 Min Dog Walk AM",
      slug: "30-min-dog-walk-am",
      userId: 1,
      servicesCategoryId: 1,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      mints: "30",
      imageUrl: "",
      seoTitle: "30 Min Dog Walk AM",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      price: 20,
      status: true,
    }
  ];
  
  for (const service of services) {
    await prisma.services.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        title: service.title,
        slug: service.slug,
        userId: service.userId,
        servicesCategoryId: service.servicesCategoryId,
        description: service.description,
        mints: service.mints,
        imageUrl: service.imageUrl,
        seoTitle: service.seoTitle,
        seoDescription: service.seoDescription,
        price: service.price,
        status: service.status,
      },
    });
  }

  const scheduleSlots = [
    {
      slug: "8-10-am",
      startTime: "08",
      startAmPM: "AM",
      endTime: "10",
      endAmPM: "AM",
    },
    {
      slug: "10-12-am",
      startTime: "10",
      startAmPM: "AM",
      endTime: "12",
      endAmPM: "AM",
    },
    {
      slug: "12-2-pm",
      startTime: "12",
      startAmPM: "PM",
      endTime: "02",
      endAmPM: "PM",
    },
    {
      slug: "2-4-pm",
      startTime: "02",
      startAmPM: "PM",
      endTime: "04",
      endAmPM: "PM",
    },
    {
      slug: "4-6-pm",
      startTime: "04",
      startAmPM: "PM",
      endTime: "06",
      endAmPM: "PM",
    },
    {
      slug: "6-8-pm",
      startTime: "06",
      startAmPM: "PM",
      endTime: "08",
      endAmPM: "PM",
    },
    {
      slug: "8-10-pm",
      startTime: "08",
      startAmPM: "PM",
      endTime: "10",
      endAmPM: "PM",
    },
    {
      slug: "10-12-pm",
      startTime: "10",
      startAmPM: "PM",
      endTime: "12",
      endAmPM: "AM",
    },
  ];

  for (const scheduleSlot of scheduleSlots) {
    await prisma.scheduleSlots.upsert({
      where: { slug: scheduleSlot.slug },
      update: {},
      create: {
        slug: scheduleSlot.slug,
        startTime: scheduleSlot.startTime,
        startAmPM: scheduleSlot.startAmPM,
        endTime: scheduleSlot.endTime,
        endAmPM: scheduleSlot.endAmPM,
        status: true,
      },
    });
  }

  await prisma.petType.upsert({
    where: { slug: 'dog' },
    update: {},
    create: { name: 'Dog', slug: 'dog' },
  });
  await prisma.petType.upsert({
    where: { slug: 'cat' },
    update: {},
    create: { name: 'Cat', slug: 'cat' },
  });
  // Helper function to find or create module
  async function findOrCreateModule(data: {
    name: string;
    routeName: string | null;
    icon: string | null;
    parentId?: number | null;
    sortOrder: number;
  }) {
    const existing = await prisma.cmModule.findFirst({
      where: {
        name: data.name,
        parentId: data.parentId ?? null,
      },
    });

    if (existing) {
      return await prisma.cmModule.update({
        where: { id: existing.id },
        data: {
          routeName: data.routeName,
          icon: data.icon,
          sortOrder: data.sortOrder,
          status: true,
        },
      });
    }

    return await prisma.cmModule.create({
      data: {
        name: data.name,
        routeName: data.routeName,
        icon: data.icon,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
        status: true,
      },
    });
  }

  // Create CMS Modules (Menu Items)
  let sortOrder = 1;

  // MAIN SECTION - Dashboard
  const dashboardModule = await findOrCreateModule({
    name: "Dashboard",
    routeName: "/admin",
    icon: "LayoutDashboard",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Services (Parent)
  const servicesModule = await findOrCreateModule({
    name: "Services",
    routeName: "#",
    icon: "Boxes",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Services Categories (Child)
  const servicesCategoriesModule = await findOrCreateModule({
    name: "All Service Categories",
    routeName: "/admin/service-categories/",
    icon: null,
    parentId: servicesModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Services (Child)
  const allServicesModule = await findOrCreateModule({
    name: "All Services",
    routeName: "/admin/service/",
    icon: null,
    parentId: servicesModule.id,
    sortOrder: 2,
  });

   // MAIN SECTION - Users (Parent)
   const usersModule = await findOrCreateModule({
    name: "Users",
    routeName: "#",
    icon: "UserCircle",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Users (Parent)
  const allUsersModule = await findOrCreateModule({
    name: "All Users",
    routeName: "/admin/users/",
    icon: null,
    parentId: usersModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Employees (Parent)
  const employeesModule = await findOrCreateModule({
    name: "Employees",
    routeName: "#",
    icon: "UserCircle",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Employees (Parent)
  const allEmployeesModule = await findOrCreateModule({
    name: "All Employees",
    routeName: "/admin/employee/",
    icon: null,
    parentId: employeesModule.id,
    sortOrder: 1,
  });

   // MAIN SECTION - Employees Services (Parent)
   const allEmployeeServicesModule = await findOrCreateModule({
    name: "Services",
    routeName: "/admin/employee-services/",
    icon: "Boxes",
    sortOrder: 1,
  });

  // MAIN SECTION - Bookings (Parent)
  const bookingsModule = await findOrCreateModule({
    name: "Bookings",
    routeName: "#",
    icon: "Calendar",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Bookings (Child)
  const allBookingsModule = await findOrCreateModule({
    name: "All Bookings",
    routeName: "/admin/booking/",
    icon: null,
    parentId: bookingsModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Bookings (Parent)
  const EmployeebookingsModule = await findOrCreateModule({
    name: "Bookings",
    routeName: "#",
    icon: "Calendar",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Bookings (Child)
  const allEmployeeBookingsModule = await findOrCreateModule({
    name: "All Bookings",
    routeName: "/admin/employee-bookings/",
    icon: null,
    parentId: EmployeebookingsModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Services (Parent)
  const schduleModule = await findOrCreateModule({
    name: "Schedule Slots",
    routeName: "#",
    icon: "Clock",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Services Categories (Child)
  const allScheduleSlotsModule = await findOrCreateModule({
    name: "All Schedule Slots",
    routeName: "/admin/schedule-slots/",
    icon: null,
    parentId: schduleModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Generate Signup Links (Parent)
  const generateSignupLinksModule = await findOrCreateModule({
    name: "Generate Signup Links",
    routeName: "#",
    icon: "Link",
    sortOrder: sortOrder++,
  });

  // MAIN SECTION - Services Categories (Child)
  const allGenerateSignupLinksModule = await findOrCreateModule({
    name: "All Generate Signup Links",
    routeName: "/admin/generate-signup-links/",
    icon: null,
    parentId: generateSignupLinksModule.id,
    sortOrder: 1,
  });
  // Collect all modules for permission creation
  const superAdminModules = [
    dashboardModule,
    servicesModule,
    servicesCategoriesModule,
    allServicesModule,
    usersModule,
    allUsersModule,
    employeesModule,
    allEmployeesModule,
    bookingsModule,
    allBookingsModule,
    schduleModule,
    allScheduleSlotsModule,
    generateSignupLinksModule,
    allGenerateSignupLinksModule,
  ];
  
  const adminModules = [
    dashboardModule,
    servicesModule,
    servicesCategoriesModule,
    allServicesModule,
    usersModule,
    allUsersModule,
    employeesModule,
    allEmployeesModule,
    bookingsModule,
    allBookingsModule,
    schduleModule,
    allScheduleSlotsModule,
    generateSignupLinksModule,
    allGenerateSignupLinksModule,
  ];
  
  const clientModules = [
    dashboardModule,
    allEmployeeServicesModule,
    EmployeebookingsModule,
    allEmployeeBookingsModule,
  ];
  
  const roleModuleMap = [
    {
      role: superAdminRole,
      modules: superAdminModules,
      fullAccess: true,
    },
    {
      role: adminRole,
      modules: adminModules,
      fullAccess: true,
    },
    {
      role: clientRole,
      modules: clientModules,
      fullAccess: false,
    },
  ];

  for (const { role, modules, fullAccess } of roleModuleMap) {
    for (const module of modules) {
      await prisma.cmsModulePermission.upsert({
        where: {
          userRoleId_cmsModuleId: {
            userRoleId: role.id,
            cmsModuleId: module.id,
          },
        },
        update: {},
        create: {
          userRoleId: role.id,
          cmsModuleId: module.id,
          isView: true,
          isAdd: fullAccess,
          isUpdate: fullAccess,
          isDelete: fullAccess,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
