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
    where: { slug: "client" },
    update: {},
    create: {
      title: "Client",
      slug: "client",
      description: "Client access",
      type: "CLIENT",
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
      title: "OverNight Services",
      slug: "overnight-services",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      imageUrl: "",
      seoTitle: "Over-Night Services",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    },
    {
      title: "Day Services",
      slug: "day-services",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      imageUrl: "",
      seoTitle: "Day Services",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    },
    {
      title: "Spa Services",
      slug: "spa-services",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      imageUrl: "",
      seoTitle: "Spa Services",
      seoDescription:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    },
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

  // MAIN SECTION - Bookings (Parent)
  const bookingsModule = await findOrCreateModule({
    name: "Bookings",
    routeName: "bookings",
    icon: "Calendar",
    sortOrder: sortOrder++,
  });

  // Bookings - All Bookings (Child)
  const allBookingsModule = await findOrCreateModule({
    name: "All Bookings",
    routeName: "#",
    icon: null,
    parentId: bookingsModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Employees (Parent)
  const employeesModule = await findOrCreateModule({
    name: "Employees",
    routeName: "employees",
    icon: "UserCircle",
    sortOrder: sortOrder++,
  });

  // Employees - All Employees (Child)
  const allEmployeesModule = await findOrCreateModule({
    name: "All Employees",
    routeName: "#",
    icon: null,
    parentId: employeesModule.id,
    sortOrder: 1,
  });

  // MAIN SECTION - Payments (Parent)
  const paymentsModule = await findOrCreateModule({
    name: "Payments",
    routeName: "payments",
    icon: "CreditCard",
    sortOrder: sortOrder++,
  });

  // Payments - All Payments (Child)
  const allPaymentsModule = await findOrCreateModule({
    name: "All Payments",
    routeName: "#",
    icon: null,
    parentId: paymentsModule.id,
    sortOrder: 1,
  });

  // USERS SECTION - Client Management (Parent)
  const clientManagementModule = await findOrCreateModule({
    name: "Client Management",
    routeName: "client-management",
    icon: "User",
    sortOrder: sortOrder++,
  });

  // Client Management - All Clients (Child)
  const allClientsModule = await findOrCreateModule({
    name: "All Clients",
    routeName: "#",
    icon: null,
    parentId: clientManagementModule.id,
    sortOrder: 1,
  });

  // USERS SECTION - Employee Assignment (Parent)
  const employeeAssignmentModule = await findOrCreateModule({
    name: "Employee Assignment",
    routeName: "employee-assignment",
    icon: "UserCheck",
    sortOrder: sortOrder++,
  });

  // Employee Assignment - All Employee Assignments (Child)
  const allEmployeeAssignmentsModule = await findOrCreateModule({
    name: "All Employee Assignments",
    routeName: "#",
    icon: null,
    parentId: employeeAssignmentModule.id,
    sortOrder: 1,
  });

  // USERS SECTION - Calendar & Time
  const calendarTimeModule = await findOrCreateModule({
    name: "Calendar & Time",
    routeName: "#",
    icon: "Calendar",
    sortOrder: sortOrder++,
  });

  // PAYMENT & REPORTINGS SECTION - Invoices
  const invoicesModule = await findOrCreateModule({
    name: "Invoices",
    routeName: "#",
    icon: "DollarSign",
    sortOrder: sortOrder++,
  });

  // PAYMENT & REPORTINGS SECTION - Two Week History
  const twoWeekHistoryModule = await findOrCreateModule({
    name: "Two Week History",
    routeName: "#",
    icon: "HistoryIcon",
    sortOrder: sortOrder++,
  });

  // PAYMENT & REPORTINGS SECTION - Appointments Requests
  const appointmentsRequestsModule = await findOrCreateModule({
    name: "Appointments Requests",
    routeName: "#",
    icon: "CalendarCheck",
    sortOrder: sortOrder++,
  });

  // PAYMENT & REPORTINGS SECTION - Send Alert
  const sendAlertModule = await findOrCreateModule({
    name: "Send Alert",
    routeName: "#",
    icon: "Bell",
    sortOrder: sortOrder++,
  });

  // PAYMENT & REPORTINGS SECTION - View Appointments Calendar
  const viewAppointmentsCalendarModule = await findOrCreateModule({
    name: "View Appointments Calendar",
    routeName: "#",
    icon: "CalendarDays",
    sortOrder: sortOrder++,
  });

  // Collect all modules for permission creation
  const allModules = [
    dashboardModule,
    bookingsModule,
    allBookingsModule,
    employeesModule,
    allEmployeesModule,
    paymentsModule,
    allPaymentsModule,
    clientManagementModule,
    allClientsModule,
    employeeAssignmentModule,
    allEmployeeAssignmentsModule,
    calendarTimeModule,
    invoicesModule,
    twoWeekHistoryModule,
    appointmentsRequestsModule,
    sendAlertModule,
    viewAppointmentsCalendarModule,
  ];

  // Create permissions for all roles
  const roles = [superAdminRole, adminRole, clientRole, userRole];

  for (const role of roles) {
    for (const module of allModules) {
      // SUPER_ADMIN and ADMIN get full access
      const isFullAccess = role.type === "SUPER_ADMIN" || role.type === "ADMIN";
      
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
          isAdd: isFullAccess,
          isView: true, // All roles can view
          isUpdate: isFullAccess,
          isDelete: isFullAccess,
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
