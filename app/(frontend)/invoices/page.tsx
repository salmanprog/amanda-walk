"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import useApi, { ApiResponse } from "@/utils/useApi";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCurrentUser } from "@/utils/currentUser";
import toast from "react-hot-toast";

const PAYMENT_MODES = [
  {
    value: "zelle",
    label: "Zelle",
    qr: "/images/payment/zelle.png?v=2",
  },
  {
    value: "cashapp",
    label: "Cash App",
    qr: "/images/payment/cashapp.png?v=2",
  },
  {
    value: "venmo",
    label: "Venmo",
    qr: "/images/payment/venmo.png?v=2",
  },
] as const;

type PaymentMode = (typeof PAYMENT_MODES)[number]["value"];

function formatTransactionAmount(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface InvoiceRow {
  id: number;
  userId: number;
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

interface InvoiceUserSummary {
  totalTransaction?: number | string;
  payTransaction?: number | string;
  remainingTransaction?: number | string;
  total_transaction?: number | string;
  pay_transaction?: number | string;
  remaining_transaction?: number | string;
}

export default function InvoicesPage() {
  useAuthGuard();
  const { user: currentUser, loadingUser } = useCurrentUser();
  const userSummary = currentUser as InvoiceUserSummary | null;

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [message, setMessage] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState<PaymentMode | "">("");
  const [transactionId, setTransactionId] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const paidModal = useModal();

  const { data, loading, fetchApi } = useApi({
    url: "/api/users/invoice",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading: submitting } = useApi({
    url: selectedInvoice ? `/api/users/invoice/${selectedInvoice.id}` : "",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    void fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const openPaidModal = (row: InvoiceRow) => {
    setSelectedInvoice(row);
    setMessage("");
    setModeOfPayment("");
    setTransactionId("");
    setFormErrors({});
    paidModal.openModal();
  };

  const closePaidModal = () => {
    paidModal.closeModal();
    setSelectedInvoice(null);
    setMessage("");
    setModeOfPayment("");
    setTransactionId("");
    setFormErrors({});
  };

  const handleModeChange = (value: string) => {
    setModeOfPayment(value as PaymentMode | "");
    if (formErrors.modeOfPayment) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.modeOfPayment;
        return next;
      });
    }
  };

  const handleSubmitPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setFormErrors({});

    const imageInput = document.getElementById("invoice-image") as HTMLInputElement;
    const imageFile = imageInput?.files?.[0];

    const errors: Record<string, string> = {};
    if (!message.trim()) {
      errors.comments = "Message is required";
    }
    if (!modeOfPayment) {
      errors.modeOfPayment = "Mode of Payment is required";
    }
    if (!transactionId.trim()) {
      errors.transactionId = "Transaction ID is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("comments", message.trim());
      formData.append("modeOfPayment", modeOfPayment);
      formData.append("transactionId", transactionId.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await sendData<ApiResponse>(formData, undefined, "PATCH");

      if (res.code === 200) {
        toast.success("Payment submitted successfully");
        closePaidModal();
        void fetchApi();
      } else {
        if (res.data && typeof res.data === "object") {
          setFormErrors(res.data as Record<string, string>);
        }
        toast.error(res.message || "Failed to submit payment");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl shadow-2xl p-6 mb-6"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CreditCard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold gradient-text text-center">My Invoices</h1>
          <p className="text-sm text-gray-500 mt-2 text-center">Your invoice history</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total transaction
            </p>
            <p className="mt-2 text-2xl font-bold text-[#1E293B] tabular-nums">
              {loadingUser
                ? "—"
                : `$${formatTransactionAmount(
                    userSummary?.totalTransaction ??
                      userSummary?.total_transaction
                  )}`}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Paid transaction
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600 tabular-nums">
              {loadingUser
                ? "—"
                : `$${formatTransactionAmount(
                    userSummary?.payTransaction ?? userSummary?.pay_transaction
                  )}`}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Remaining transaction
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600 tabular-nums">
              {loadingUser
                ? "—"
                : `$${formatTransactionAmount(
                    userSummary?.remainingTransaction ??
                      userSummary?.remaining_transaction
                  )}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 max-w-full overflow-x-auto">
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
                  Invoice Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Mode of Payment
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Transaction ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Payment Status
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
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
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
                      {formatDate(row.invoiceDate)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 tabular-nums">
                      ${formatTransactionAmount(row.invoiceAmount)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.modeOfPayment}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.transactionId}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={row.isPaid ? "success" : "warning"}>
                        {row.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {row.userPaid === 1 ? (
                        <Badge size="sm" color="success">
                          Submitted
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openPaidModal(row)}
                          className="!px-3 !py-1.5"
                        >
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <Modal isOpen={paidModal.isOpen} onClose={closePaidModal} className="max-w-2xl w-full p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Submit Payment
        </h2>
        <form onSubmit={handleSubmitPaid} className="space-y-4">
          <div>
            <Label>
              Mode of Payment <span className="text-error-500">*</span>
            </Label>
            <div className="mt-2">
              <Select
                options={PAYMENT_MODES.map((mode) => ({
                  value: mode.value,
                  label: mode.label,
                }))}
                placeholder="Select mode of payment"
                value={modeOfPayment}
                onChange={handleModeChange}
              />
            </div>
            {formErrors.modeOfPayment && (
              <p className="mt-2 text-sm text-error-500">{formErrors.modeOfPayment}</p>
            )}
          </div>

          <div>
            <Label>
              Scan QR Code <span className="text-error-500">*</span>
            </Label>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAYMENT_MODES.map((mode) => {
                const selected = modeOfPayment === mode.value;
                return (
                  <label
                    key={mode.value}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      selected
                        ? "border-[var(--primary-theme)] ring-2 ring-[var(--primary-theme)]/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="modeOfPaymentQr"
                      value={mode.value}
                      checked={selected}
                      onChange={() => handleModeChange(mode.value)}
                      className="sr-only"
                    />
                    <img
                      src={mode.qr}
                      alt={`${mode.label} QR code`}
                      className="mx-auto aspect-square h-36 w-36 rounded-lg object-cover object-top bg-white"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-gray-800">
                      {mode.label}
                    </p>
                  </label>
                );
              })}
            </div>
            {formErrors.modeOfPayment && (
              <p className="mt-2 text-sm text-error-500">{formErrors.modeOfPayment}</p>
            )}
          </div>

          <div>
            <Label>
              Transaction ID <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              error={!!formErrors.transactionId}
              hint={formErrors.transactionId}
            />
          </div>

          <div>
            <Label>
              Message <span className="text-error-500">*</span>
            </Label>
            <TextArea
              placeholder="Enter your message"
              rows={4}
              value={message}
              onChange={setMessage}
              error={!!formErrors.comments}
              hint={formErrors.comments}
            />
          </div>

          <div>
            <Label>Upload Image (optional)</Label>
            <input
              id="invoice-image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-theme)] file:text-white hover:file:opacity-90"
            />
            {formErrors.attachments && (
              <p className="mt-2 text-sm text-error-500">{formErrors.attachments}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closePaidModal}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Paid
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
