"use client";

import React from "react";
import Link from "next/link";
import { PawPrint, CalendarCheck, User } from "lucide-react";

export default function Tabs() {
  const tabs = [
    {
      name: "Pet",
      href: "/pets-list",
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
  ];

  return (
    <div className="mt-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="group border border-gray-200 rounded-2xl  flex flex-col items-center justify-center bg-white hover:border-indigo-600 shadow-2xl p-6  transition-all"
            >
              <Icon className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-600">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
