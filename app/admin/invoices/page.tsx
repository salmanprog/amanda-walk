"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface InvoiceRow {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  invoiceDate: string;
  invoiceAmount: number;
  isPaid: boolean;
  userPaid: number;
  modeOfPayment: string | null;
  transactionId: string | null;
  comments: string | null;
  attachments: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const viewModal = useModal();

  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/invoice",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    document.title = "Admin | Invoices";
  }, []);

  useEffect(() => {
    void fetchApi();
  }, []);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setInvoices(data as InvoiceRow[]);
    }
  }, [data]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0.00";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleView = (row: InvoiceRow) => {
    setSelectedInvoice(row);
    viewModal.openModal();
  };

  const closeViewModal = () => {
    viewModal.closeModal();
    setSelectedInvoice(null);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Invoices
          </h3>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User Name
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Invoice Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Invoice Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Admin Payment Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User Payment Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length > 0 ? (
                invoices.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.id}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.userName ?? "—"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.userEmail ?? "—"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(row.invoiceDate)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 tabular-nums">
                      ${formatAmount(row.invoiceAmount)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={row.isPaid ? "success" : "warning"}>
                        {row.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={row.userPaid === 1 ? "success" : "warning"}>
                        {row.userPaid === 1 ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Button size="sm" onClick={() => handleView(row)} className="!px-3 !py-1.5">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={viewModal.isOpen} onClose={closeViewModal} className="max-w-2xl w-full p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Invoice Details
        </h2>
        {selectedInvoice && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Invoice ID</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{selectedInvoice.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">User Name</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {selectedInvoice.userName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-white break-all">
                {selectedInvoice.userEmail ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Invoice Date</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatDate(selectedInvoice.invoiceDate)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Admin Payment Status</dt>
              <dd className="mt-1">
                <Badge size="sm" color={selectedInvoice.isPaid ? "success" : "warning"}>
                  {selectedInvoice.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">User Payment Status</dt>
              <dd className="mt-1">
                <Badge size="sm" color={selectedInvoice.userPaid === 1 ? "success" : "warning"}>
                  {selectedInvoice.userPaid === 1 ? "Paid" : "Unpaid"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Mode of Payment</dt>
              <dd className="font-medium text-gray-900 dark:text-white capitalize">
                {selectedInvoice.modeOfPayment ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Transaction ID</dt>
              <dd className="font-medium text-gray-900 dark:text-white break-all">
                {selectedInvoice.transactionId ?? "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500 dark:text-gray-400">Comments</dt>
              <dd className="font-medium text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                {selectedInvoice.comments?.trim() ? selectedInvoice.comments : "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500 dark:text-gray-400">Attachment</dt>
              <dd className="mt-2">
                {selectedInvoice.attachments ? (
                  <img
                    src={selectedInvoice.attachments}
                    alt="Invoice attachment"
                    className="max-h-48 rounded-lg border border-gray-200 object-contain"
                  />
                ) : (
                  <span className="font-medium text-gray-900 dark:text-white">—</span>
                )}
              </dd>
            </div>
          </dl>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={closeViewModal}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
