export const LOYALTY_CONFIG = {
  Bronze: {
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
  Silver: {
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
  Gold: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
  },
};

export const customers = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  customerName: `User Name ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `0812-3456-78${String(i).padStart(2, "0")}`,
  loyalty: ["Bronze", "Silver", "Gold"][i % 3],
}));
