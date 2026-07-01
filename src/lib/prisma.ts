import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });
}

function hasTransactionDelegate(client: PrismaClient): boolean {
  return typeof client.transaction?.findFirst === "function";
}

function invoiceModelHasFields(
  fields: ReadonlyArray<{ name: string }> | undefined,
  required: string[]
): boolean {
  if (!Array.isArray(fields)) return false;
  return required.every((name) => fields.some((field) => field.name === name));
}

function hasInvoiceExtendedFields(client: PrismaClient): boolean {
  const required = ["userPaid", "invoiceAmount"];
  const runtime = (
    client as unknown as {
      _runtimeDataModel?: { models?: { Invoice?: { fields?: { name: string }[] } } };
    }
  )._runtimeDataModel;
  const runtimeFields = runtime?.models?.Invoice?.fields;
  if (Array.isArray(runtimeFields)) {
    return invoiceModelHasFields(runtimeFields, required);
  }

  const schemaModel = Prisma.dmmf.datamodel.models.find((model) => model.name === "Invoice");
  return invoiceModelHasFields(schemaModel?.fields, required);
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && hasTransactionDelegate(cached) && hasInvoiceExtendedFields(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined as unknown as PrismaClient;
  }

  const client = createPrismaClient();
  if (!hasTransactionDelegate(client)) {
    throw new Error(
      "Prisma client is missing the Transaction model. Run `npx prisma generate` and restart the dev server."
    );
  }

  if (!hasInvoiceExtendedFields(client)) {
    throw new Error(
      "Prisma client is missing Invoice fields (userPaid, invoiceAmount, comments, attachments). Run `npx prisma generate` and restart the dev server."
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
