// src/components/projects/modals/CreateProjectModal.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import type { IProject } from "../../types/project";
import { useProjectStore } from "../../stores/projectStore";
import { useAuthStore } from "../../stores/authStore";
import Modal from "../ui/modal/Modal";
import { extractErrorMessage } from "../../types/api";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialProject?: IProject;
}

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  key: z
    .string()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key must be less than 10 characters")
    .regex(/^[A-Z][A-Z0-9]{1,9}$/, "Project key must start with a letter, followed by letters or numbers"),
  type: z.enum(["kanban", "scrum"] as const),
  access: z.enum(["public", "private"] as const),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
});

type ProjectFormData = z.infer<typeof createProjectSchema>;

const CreateProjectModal = ({ isOpen, onClose, isEditing = false, initialProject }: CreateProjectModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createProject, updateProject, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    mode: "onChange", // Validate on change to enable/disable submit button
    defaultValues: {
      name: "",
      key: "",
      type: "kanban",
      access: "private",
      description: "",
    },
  });

  const type = watch("type");
  const access = watch("access");

  // Set initial values for edit mode
  useEffect(() => {
    if (isEditing && initialProject) {
      reset({
        name: initialProject.name,
        key: initialProject.key,
        type: initialProject.type as "kanban" | "scrum",
        access: initialProject.access as "public" | "private",
        description: initialProject.description || "",
      });
    }
  }, [isEditing, initialProject, reset]);

  // Debug: Log validation errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // console.log("❌ Form Validation Errors:", errors);
      // console.log("❌ Form isValid:", isValid);
    }
  }, [errors, isValid]);

  const handleFormSubmit = handleSubmit(
    async (data) => {
      // Prevent multiple submissions
      if (isLoading) {
        // console.warn("⚠️ [handleFormSubmit] Already submitting, ignoring duplicate submit");
        return;
      }

      // console.log("🟢 [handleFormSubmit] Form submitted with data:", data);
      // console.log("🟢 [handleFormSubmit] Starting project creation...");
      // console.log("🟢 [handleFormSubmit] Current user:", user);
      // console.log("🟢 [handleFormSubmit] User ID:", user?.id);
      
      setIsLoading(true);

      try {
        // Lấy userId từ authStore
        if (!user?.id) {
          console.error("❌ [handleFormSubmit] No user ID found! User object:", user);
          toast.error("You must be logged in to create a project");
          setIsLoading(false);
          return;
        }

        // console.log("🟢 [handleFormSubmit] User ID confirmed:", user.id);
        // console.log("🟢 [handleFormSubmit] Creating project with data:", {
        //   name: data.name,
        //   key: data.key,
        //   description: data.description || null,
        //   access: data.access,
        //   type: data.type,
        // });

        if (isEditing && initialProject) {
          await updateProject(initialProject.id, {
            name: data.name,
            key: data.key,
            type: data.type,
            access: data.access,
            description: data.description || null,
          });
          toast.success("Project updated successfully!");
        } else {
          // Note: ownerId is set by backend from req.user.userId, so we don't send it
          // console.log("🟢 [handleFormSubmit] Calling createProject from store...");
          const result = await createProject({
            name: data.name,
            key: data.key,
            description: data.description || null,
            access: data.access,
            type: data.type,
          });
          // console.log("🟢 [handleFormSubmit] Project created successfully:", result);
          toast.success("Project created successfully!");
          // Refresh projects list after creation
          // console.log("🟢 [handleFormSubmit] Refreshing projects list...");
          await fetchProjects();
          // console.log("🟢 [handleFormSubmit] Projects list refreshed");
        }

        // console.log("🟢 [handleFormSubmit] Closing modal and resetting form...");
        onClose();
        reset();
        // console.log("🟢 [handleFormSubmit] Modal closed and form reset");
      } catch (error) {
        console.error("❌ Error creating/updating project:", error);
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} project: ${extractErrorMessage(error)}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    (errors) => {
      // Validation errors callback
      // console.log("❌ Validation Errors:", errors);
    }
  );

  if (!isOpen) return null;

  return (
    <Modal
      title={isEditing ? "Update Project" : "Create Project"}
      onClose={onClose}
      className="w-[500px] max-h-[90vh]"
      hideFooter={true}
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Prevent multiple submissions
          if (isLoading) {
            // console.warn("⚠️ [Form] Already submitting, preventing duplicate submit");
            return;
          }
          
          // console.log("🟡 [Form] onSubmit event triggered (native HTML submit)");
          // console.log("🟡 [Form] Event details:", {
          //   type: e.type,
          //   target: e.target,
          //   currentTarget: e.currentTarget,
          //   defaultPrevented: e.defaultPrevented,
          //   isLoading,
          // });
          
          // Call handleFormSubmit which will handle validation
          handleFormSubmit(e);
        }}
        id="create-project-form"
        noValidate
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter project name"
              maxLength={100}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 100 characters</p>
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

        <div>
          <label htmlFor="key" className="mb-1 block text-sm font-medium text-gray-700">
            Project Key <span className="text-red-500">*</span>
          </label>
          <input
            id="key"
            {...register("key")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
            placeholder="e.g. PRJ, TASK1 (2-10 chars, starts with letter)"
            maxLength={10}
            autoComplete="off"
            onChange={(e) => {
              // Only auto-uppercase, allow all input (validation will show error if invalid)
              const value = e.target.value.toUpperCase();
              setValue("key", value, { shouldValidate: true });
            }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Must start with a letter, followed by letters or numbers (2-10 characters)
          </p>
          {errors.key && <p className="mt-1 text-sm text-red-500">{errors.key.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register("type")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
              autoComplete="off"
            >
              <option value="kanban">Kanban</option>
              <option value="scrum">Scrum</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {type === "scrum" ? "Sprint-based workflow" : "Continuous workflow"}
            </p>
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="access" className="mb-1 block text-sm font-medium text-gray-700">
              Access Level <span className="text-red-500">*</span>
            </label>
            <select
              id="access"
              {...register("access")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
              autoComplete="off"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {access === "public" ? "Visible to all users" : "Only members can access"}
            </p>
            {errors.access && <p className="mt-1 text-sm text-red-500">{errors.access.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={4}
            placeholder="Describe your project goals, scope, and key features..."
            maxLength={1000}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-gray-500">Maximum 1000 characters</p>
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
        </div>
        </div>

        {/* Form Footer with Submit Button */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isLoading ? "Loading..." : isEditing ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
