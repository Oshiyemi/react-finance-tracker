"use client";

// A reusable card for showing a financial summary (Balance, Income, Expenses)
export default function SummaryCard({ title, amount, icon: Icon, type }) {
  // Pick colors based on the card type
  const colorMap = {
    balance: "bg-primary/10 text-primary",
    income: "bg-income/10 text-income",
    expense: "bg-expense/10 text-expense",
  };

  const amountColorMap = {
    balance: "text-foreground",
    income: "text-income",
    expense: "text-expense",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[type]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-2xl font-bold ${amountColorMap[type]}`}>
        {/* Format the amount as currency */}
        {type === "expense" ? "-" : ""}${Math.abs(amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}
