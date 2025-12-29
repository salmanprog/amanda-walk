import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import EmployeeServiceResource from "@/resources/EmployeeServiceResource";

export const runtime = "nodejs";

function getPrismaModel(possibleNames: string[]) {
  for (const name of possibleNames) {
    if ((prisma as any)[name]) return (prisma as any)[name];
  }
  return null;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let data: any = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") data[key] = value;
      }
    } else if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type", data: {} },
        { status: 415 }
      );
    }

    const userId = Number(data.userId);
    const serviceCategories = JSON.parse(data.serviceCategories || "[]");

    if (!userId || !Array.isArray(serviceCategories) || !serviceCategories.length) {
      return NextResponse.json(
        { code: 422, message: "Invalid payload", data: {} },
        { status: 422 }
      );
    }

    const rows: any[] = [];

    for (const cat of serviceCategories) {
      for (const serviceId of cat.services) {
        rows.push({
          slug: `${userId}-${cat.categoryId}-${serviceId}`,
          userId,
          serviceCategoryId: Number(cat.categoryId),
          serviceId: Number(serviceId),
          serviceCategoryTitle: "",
          serviceTitle: null,
          servicePrice: "0",
        });
      }
    }

    // Soft delete old entries
    await prisma.employeeServices.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    const serviceIds = rows.map(r => r.serviceId);
    const categoryIds = rows.map(r => r.serviceCategoryId);

    const ServiceModel = getPrismaModel(["service", "services", "Service", "Services"]);
    const CategoryModel = getPrismaModel(["serviceCategory", "serviceCategories", "ServiceCategory", "ServiceCategories"]);

    if (!ServiceModel || !CategoryModel) {
      console.error("Available Prisma models:", Object.keys(prisma));
      return NextResponse.json(
        { code: 500, message: "Prisma model mismatch. Check schema names.", data: {} },
        { status: 500 }
      );
    }

    const [services, categories] = await Promise.all([
      ServiceModel.findMany({ where: { id: { in: serviceIds } } }),
      CategoryModel.findMany({ where: { id: { in: categoryIds } } }),
    ]);

    const serviceMap = Object.fromEntries(services.map((s: any) => [s.id, s]));
    const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c]));

    for (const row of rows) {
      row.serviceTitle = serviceMap[row.serviceId]?.title ?? null;
      row.serviceCategoryTitle = categoryMap[row.serviceCategoryId]?.title ?? "";
      row.servicePrice = String(serviceMap[row.serviceId]?.price ?? "0");
    }

    await prisma.employeeServices.createMany({ data: rows });

    const employeeServices = await prisma.employeeServices.findMany({ where: { userId } });

    // Apply Resource Transformer
    const resource = new EmployeeServiceResource();
    const transformed = await resource.collection(employeeServices);

    return NextResponse.json(
      {
        code: 200,
        message: "success",
        data: transformed,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Employee service save error:", error);

    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
        data: {},
        error: error.message,
      },
      { status: 500 }
    );
  }
}
