"use client";

import { useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCategories, useCreateTicket } from "@/hooks/use-tickets";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTicketModal({
  isOpen,
  onClose,
}: CreateTicketModalProps) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [priorityId, setPriorityId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const { data: categoriesData } = useCategories();
  const createTicket = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!categoryId || !priorityId || !subject.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await createTicket.mutateAsync({
        category: categoryId,
        priority_id: priorityId,
        subject: subject.trim(),
        description: description.trim(),
      });
      // Reset form
      setCategoryId("");
      setPriorityId("");
      setSubject("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create ticket. Please try again."
      );
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className="max-h-[90vh] overflow-y-auto max-w-lg scrollbar-hide">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create New Ticket</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <form onSubmit={handleSubmit} id="create-ticket-form">
          <div className="px-4 pb-4 md:px-0 md:pb-0">
            <div className="space-y-4">
              <div>
                <Label className="mb-2">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.categories &&
                      Object.entries(categoriesData.categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Priority</Label>
                <Select value={priorityId} onValueChange={setPriorityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.priorities &&
                      // Define priority order: urgent > high > medium > low
                      Object.entries(categoriesData.priorities)
                        .sort(([keyA], [keyB]) => {
                          const order = { urgent: 4, high: 3, medium: 2, low: 1 };
                          return (
                            (order[keyB as keyof typeof order] || 0) -
                            (order[keyA as keyof typeof order] || 0)
                          );
                        })
                        .map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="mb-2">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter ticket subject"
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2">Message</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe your issue or request..."
                  className="resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <ResponsiveModalFooter className="md:mt-10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-ticket-form"
              disabled={createTicket.isPending}
              className="w-full md:w-auto bg-brand hover:bg-brand/90"
            >
              {createTicket.isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
