"use client";



import { useEffect, useState } from "react";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import Button from "@/components/ui/button/Button";

import Input from "@/components/form/input/InputField";

import Label from "@/components/form/Label";

import { Modal } from "@/components/ui/modal";

import { useModal } from "@/hooks/useModal";

import useApi, { ApiResponse } from "@/utils/useApi";

import toast from "react-hot-toast";



interface TransactionSummary {

  userId: number;

  userName: string | null;

  userEmail: string | null;

  totalBookingAmount: number;

  transactionCount: number;

  receivedAmount: number;

  remainingAmount: number;

}



export default function TransactionList() {

  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);

  const [selectedRow, setSelectedRow] = useState<TransactionSummary | null>(null);

  const [invoiceAmount, setInvoiceAmount] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const invoiceModal = useModal();



  const { data, loading, fetchApi } = useApi({

    url: "/api/admin/transaction",

    method: "GET",

    type: "manual",

    requiresAuth: true,

  });



  const { sendData, loading: submitting } = useApi({

    url: "/api/admin/invoice",

    type: "manual",

    requiresAuth: true,

  });



  useEffect(() => {

    document.title = "Admin | Transactions";

  }, []);



  useEffect(() => {

    fetchApi();

  }, []);



  useEffect(() => {

    if (data && Array.isArray(data)) {

      setTransactions(data);

    }

  }, [data]);



  const formatAmount = (amount: number) => `$${Number(amount).toFixed(2)}`;



  const handleGenerateInvoice = (row: TransactionSummary) => {

    setSelectedRow(row);

    setInvoiceAmount("");

    setFormErrors({});

    invoiceModal.openModal();

  };



  const closeInvoiceModal = () => {

    invoiceModal.closeModal();

    setSelectedRow(null);

    setInvoiceAmount("");

    setFormErrors({});

  };



  const handleSubmitInvoice = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!selectedRow) return;



    setFormErrors({});

    const amount = Number(invoiceAmount);

    const remaining = Number(selectedRow.remainingAmount);



    if (!invoiceAmount.trim() || Number.isNaN(amount) || amount <= 0) {

      setFormErrors({ invoiceAmount: "Invoice amount is required" });

      return;

    }



    if (amount > remaining) {

      setFormErrors({

        invoiceAmount: "Invoice amount cannot be greater than remaining balance",

      });

      return;

    }



    try {

      const res = await sendData<ApiResponse>(

        {

          userId: selectedRow.userId,

          invoiceAmount: amount,

        },

        undefined,

        "POST"

      );



      if (res.code === 200) {

        toast.success("Invoice generated successfully");

        closeInvoiceModal();

        fetchApi();

      } else if (res.code === 400 || res.code === 422) {

        const errors = (res.data as Record<string, string>) ?? {};

        setFormErrors(errors);

        const firstError = Object.values(errors)[0];

        toast.error(firstError || res.message || "Validation failed");

      } else {

        toast.error(res.message || "Failed to generate invoice");

      }

    } catch (err: unknown) {

      toast.error(err instanceof Error ? err.message : "Server error");

    }

  };



  return (

    <>

      <Modal

        isOpen={invoiceModal.isOpen}

        onClose={closeInvoiceModal}

        className="max-w-[500px] p-6 lg:p-8 m-4"

      >

        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">

          Generate Invoice

        </h3>

        {formErrors.invoice && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
            {formErrors.invoice}
          </div>
        )}

        <form onSubmit={handleSubmitInvoice} className="space-y-5">

          <div>

            <Label>Remaining Balance</Label>

            <Input

              type="text"

              value={

                selectedRow != null

                  ? formatAmount(selectedRow.remainingAmount)

                  : ""

              }

              disabled

            />

          </div>



          <div>

            <Label>

              Invoice Amount <span className="text-red-500">*</span>

            </Label>

            <Input

              type="number"

              name="invoiceAmount"

              value={invoiceAmount}

              onChange={(e) => setInvoiceAmount(e.target.value)}

              min="0.01"

              max={selectedRow ? String(selectedRow.remainingAmount) : undefined}

              step={0.01}

              placeholder="Enter invoice amount"

              error={!!formErrors.invoiceAmount}

              hint={formErrors.invoiceAmount}

            />

          </div>



          <div className="flex items-center justify-end gap-3 pt-2">

            <Button type="button" variant="outline" onClick={closeInvoiceModal}>

              Cancel

            </Button>

            <Button type="submit" loading={submitting}>

              Generate

            </Button>

          </div>

        </form>

      </Modal>



      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">

            Transactions

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

                  User ID

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

                  Transaction Count

                </TableCell>

                <TableCell

                  isHeader

                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"

                >

                  Total Booking Amount

                </TableCell>

                <TableCell

                  isHeader

                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"

                >

                  Received Amount

                </TableCell>

                <TableCell

                  isHeader

                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"

                >

                  Remaining Amount

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

                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">

                    Loading transactions...

                  </TableCell>

                </TableRow>

              ) : transactions.length > 0 ? (

                transactions.map((row) => (

                  <TableRow key={row.userId}>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {row.userId}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {row.userName ?? "—"}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {row.userEmail ?? "—"}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {row.transactionCount}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {formatAmount(row.totalBookingAmount)}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {formatAmount(row.receivedAmount)}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      {formatAmount(row.remainingAmount)}

                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">

                      <Button

                        type="button"

                        size="sm"

                        variant="primary"

                        onClick={() => handleGenerateInvoice(row)}

                      >

                        Generate Invoice

                      </Button>

                    </TableCell>

                  </TableRow>

                ))

              ) : (

                <TableRow>

                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">

                    No transactions found.

                  </TableCell>

                </TableRow>

              )}

            </TableBody>

          </Table>

        </div>

      </div>

    </>

  );

}


