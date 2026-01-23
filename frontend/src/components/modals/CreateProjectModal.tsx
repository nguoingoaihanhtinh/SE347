// src/components/projects/modals/CreateProjectModal.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import type { IProject } from "../../types/project";
import { useProjectStore } from "../../stores/projectStore";
import Modal from "../ui/modal/Modal";
import { Dropdown, type MenuProps } from "antd";
import { extractErrorMessage } from "../../types/api";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialProject?: IProject;
}

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  key: z.string().min(1, "Project key is required").max(10),
  type: z.enum(["kanban", "scrum"] as const),
  access: z.enum(["public", "private"] as const),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof createProjectSchema>;

const CreateProjectModal = ({ isOpen, onClose, isEditing = false, initialProject }: CreateProjectModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createProject, updateProject } = useProjectStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
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

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);

    try {
      // Lấy userId từ localStorage (được lưu khi đăng nhập)
      const currentUser = localStorage.getItem("user");
      if (!currentUser) {
        toast.error("You must be logged in to create a project");
        return;
      }

      const userId = JSON.parse(currentUser).id;

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
        await createProject({
          name: data.name,
          key: data.key,
          description: data.description || null,
          access: data.access,
          type: data.type,
          ownerId: userId,
        });
        toast.success("Project created successfully!");
      }

      onClose();
      reset();
    } catch (error) {
      console.error("Error creating/updating project:", error);
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} project: ${extractErrorMessage(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  });

  if (!isOpen) return null;

  // ✅ Tạo menu items cho dropdown
  const typeItems: MenuProps["items"] = [
    { key: "kanban", label: "Kanban", onClick: () => setValue("type", "kanban") },
    { key: "scrum", label: "Scrum", onClick: () => setValue("type", "scrum") },
  ];

  const accessItems: MenuProps["items"] = [
    { key: "private", label: "Private", onClick: () => setValue("access", "private") },
    { key: "public", label: "Public", onClick: () => setValue("access", "public") },
  ];

  return (
    <Modal
      title={isEditing ? "Update Project" : "Create Project"}
      onClose={onClose}
      buttonContent={isLoading ? "Loading..." : isEditing ? "Update Project" : "Create Project"}
      onSubmit={onSubmit}
      className="w-[500px]"
      isLoadingButton={isLoading}
    >
      <div className="space-y-4 p-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            {...register("name")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter project name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="key" className="mb-1 block text-sm font-medium text-gray-700">
            Project Key <span className="text-red-500">*</span>
          </label>
          <input
            id="key"
            {...register("key")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. PRJ, TASK (max 10 chars)"
          />
          {errors.key && <p className="mt-1 text-sm text-red-500">{errors.key.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
              Project Type <span className="text-red-500">*</span>
            </label>
            <Dropdown menu={{ items: typeItems }} trigger={["click"]} placement="bottomLeft">
              <div className="w-full rounded-md border border-gray-300 px-3 py-2 text-left cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            </Dropdown>
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="access" className="mb-1 block text-sm font-medium text-gray-700">
              Access <span className="text-red-500">*</span>
            </label>
            <Dropdown menu={{ items: accessItems }} trigger={["click"]} placement="bottomLeft">
              <div className="w-full rounded-md border border-gray-300 px-3 py-2 text-left cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                {access.charAt(0).toUpperCase() + access.slice(1)}
              </div>
            </Dropdown>
            {errors.access && <p className="mt-1 text-sm text-red-500">{errors.access.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            placeholder="Project description (optional)"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
