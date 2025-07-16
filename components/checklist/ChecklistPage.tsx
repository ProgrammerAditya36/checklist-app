"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChecklistItem } from "@/types";
import { CheckCircle, Clock, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface ChecklistPageProps {
  checklistId: string;
}

export function ChecklistPage({ checklistId }: ChecklistPageProps) {
  const [checklist, setChecklist] = useState<{
    items: ChecklistItem[];
    createdAt: string;
    expiresAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await fetch(`/api/checklist/${checklistId}`);
        if (!response.ok) {
          throw new Error("Checklist not found or expired");
        }
        const data = await response.json();
        setChecklist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistId]);

  const toggleItem = (index: number) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const downloadAsText = () => {
    if (!checklist) return;

    const content = checklist.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} - Quantity: ${item.quantity}, Price: Rs.${
            item.price
          }`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist-${checklistId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!checklist) return null;

  const totalPrice = checklist.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const completedCount = completedItems.size;
  const totalItems = checklist.items.length;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Checklist</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  Expires: {new Date(checklist.expiresAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>
                  {completedCount}/{totalItems} completed
                </span>
              </div>
            </div>
          </div>
          <Button onClick={downloadAsText} variant="outline">
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>

        <div className="grid gap-4 mb-6">
          {checklist.items.map((item, index) => (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-all ${
                completedItems.has(index)
                  ? "bg-green-50 border-green-200"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => toggleItem(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      completedItems.has(index)
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {completedItems.has(index) && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>
                  <div
                    className={
                      completedItems.has(index)
                        ? "line-through text-gray-500"
                        : ""
                    }
                  >
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-right ${
                    completedItems.has(index)
                      ? "line-through text-gray-500"
                      : ""
                  }`}
                >
                  <p className="font-semibold">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Rs.{item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">
              Rs.${totalPrice.toFixed(2)}
            </span>
          </div>
        </Card>
      </Card>
    </div>
  );
}
