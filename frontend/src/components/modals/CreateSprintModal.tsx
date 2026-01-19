// src/components/projects/modals/CreateSprintModal.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSprint, useUpdateSprint } from "@/hooks/useSprint";
import Modal from "../ui/modal/Modal";

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isEditing?: boolean;
  initialSprint?: {
    id: string;
    name: string;
    dateStarted: string;
    dateEnded: string;
    goal?: string;
  };
}

const sprintSchema = z
  .object({
    name: z.string().min(1, "Sprint name is required"),
    dateStarted: z.string().min(1, "Start date is required"),
    dateEnded: z.string().min(1, "End date is required"),
    goal: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dateStarted && data.dateEnded) {
      const startDate = new Date(data.dateStarted);
      const endDate = new Date(data.dateEnded);
      if (startDate >= endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["dateEnded"],
        });
      }
    }
  });

type SprintFormData = z.infer<typeof sprintSchema>;

const CreateSprintModal = ({
  isOpen,
  onClose,
  projectId,
  isEditing = false,
  initialSprint,
}: CreateSprintModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { createSprint } = useCreateSprint();
  const { updateSprint } = useUpdateSprint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: "",
      dateStarted: "",
      dateEnded: "",
      goal: "",
    },
  });

  // Set initial values for edit mode
  useEffect(() => {
    if (isEditing && initialSprint) {
      reset({
        name: initialSprint.name,
        dateStarted: initialSprint.dateStarted.split("T")[0], // Convert to YYYY-MM-DD
        dateEnded: initialSprint.dateEnded.split("T")[0],
        goal: initialSprint.goal || "",
      });
    }
  }, [isEditing, initialSprint, reset]);

  const onSubmit = handleSubmit(async (data: SprintFormData) => {
    setIsLoading(true);

    try {
      // Calculate duration in days
      const startDate = new Date(data.dateStarted);
      const endDate = new Date(data.dateEnded);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      if (isEditing && initialSprint) {
        await updateSprint(projectId, initialSprint.id, {
          name: data.name,
          goal: data.goal || "",
          dateStarted: data.dateStarted,
          dateEnded: data.dateEnded,
        });
      } else {
        await createSprint(projectId, {
          name: data.name,
          goal: data.goal || "",
          dateStarted: data.dateStarted,
          dateEnded: data.dateEnded,
          duration,
          projectId,
        });
      }

      onClose();
      reset();
    } catch (error) {
      console.error("Error creating/updating sprint:", error);
    } finally {
      setIsLoading(false);
    }
  });

  if (!isOpen) return null;

  return (
    <Modal
      title={isEditing ? "Update Sprint" : "Create Sprint"}
      onClose={onClose}
      buttonContent={isLoading ? "Loading..." : isEditing ? "Update Sprint" : "Create Sprint"}
      onSubmit={onSubmit}
      isLoadingButton={isLoading}
    >
      <div className="p-4">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Sprint 1"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateStarted" className="mb-1 block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dateStarted"
                type="date"
                {...register("dateStarted")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.dateStarted && <p className="mt-1 text-sm text-red-500">{errors.dateStarted.message}</p>}
            </div>

            <div>
              <label htmlFor="dateEnded" className="mb-1 block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dateEnded"
                type="date"
                {...register("dateEnded")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.dateEnded && <p className="mt-1 text-sm text-red-500">{errors.dateEnded.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="goal" className="mb-1 block text-sm font-medium text-gray-700">
              Sprint Goal
            </label>
            <textarea
              id="goal"
              {...register("goal")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              placeholder="What do you want to achieve in this sprint?"
            />
            {errors.goal && <p className="mt-1 text-sm text-red-500">{errors.goal.message}</p>}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateSprintModal;
