"use client";

import React from "react";
import Link from "next/link";
import { PawPrint, CalendarCheck, User, CreditCard } from "lucide-react";

export default function Tabs() {
  const tabs = [
    {
      name: "Pet",
      href: "/pets",
      icon: PawPrint,
    },
    {
      name: "Appointment",
      href: "/service",
      icon: CalendarCheck,
    },
    {
      name: "My Account",
      href: "/account",
      icon: User,
    },
    {
      name: "Booking",
      href: "/booking",
      icon: CalendarCheck,
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: CreditCard,
    },
  ];

  return (
    <div className="mt-6 mb-6">
      <div className="flex flex-row gap-2 sm:gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="group flex-1 border border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-white hover:border-indigo-600 shadow-2xl p-3 sm:p-6 transition-all"
            >
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary-theme)] mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold text-gray-600 text-center">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
