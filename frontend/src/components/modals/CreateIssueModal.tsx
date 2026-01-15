// src/components/projects/modals/CreateIssueModal.tsx
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Modal from "../ui/modal/Modal";
import UserAvatar from "../ui/user/userAvatar";

import type { CreateIssueParams, IIssue, UpdateIssueParams } from "../../types/issue";
import { useProjectStore } from "../../stores/projectStore";
import { useColumnStore } from "../../stores/columnStore";
import { useSprintStore } from "../../stores/sprintStore";
import { useIssueStore } from "../../stores/issueStore";
import Dropdown from "../ui/Dropdown";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  sprintId?: string;
  isEditing?: boolean;
  initialIssue?: IIssue;
  defaultSprintId?: string;
}

const ISSUE_TYPES = ["task", "story", "bug", "epic"] as const;
type IssueType = (typeof ISSUE_TYPES)[number];
const ISSUE_PRIORITIES = ["low", "medium", "high", "critical"] as const;
type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

const issueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  columnId: z.string().min(1),
  priority: z.enum(ISSUE_PRIORITIES),
  type: z.enum(ISSUE_TYPES),
  sprintId: z.string().optional(),
  assigneeId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

type IssueFormInputs = z.infer<typeof issueSchema>;

const CreateIssueModal = ({
  isOpen,
  onClose,
  projectId,
  sprintId,
  isEditing = false,
  initialIssue,
  defaultSprintId,
}: CreateIssueModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject } = useProjectStore();
  const { columns, fetchColumns } = useColumnStore();
  const { sprints, fetchSprintsByProject } = useSprintStore();
  const { createIssue, updateIssue } = useIssueStore();
  const [selectedSprintId, setSelectedSprintId] = useState<string | undefined>(sprintId);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormInputs>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      columnId: "",
      priority: "medium",
      type: "task",
      sprintId: defaultSprintId || "",
      assigneeId: "",
      attachments: [],
    },
  });

  const columnId = watch("columnId");
  const priority = watch("priority");
  const type = watch("type");

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen || !projectId) return;

    const loadData = async () => {
      try {
        await Promise.all([fetchColumns(projectId), fetchSprintsByProject(projectId)]);
      } catch (error) {
        console.error("Failed to load project data:", error);
      }
    };

    loadData();
  }, [isOpen, projectId]);

  // Set initial values for edit mode
  useEffect(() => {
    if (isEditing && initialIssue && columns.length > 0) {
      reset({
        title: initialIssue.title,
        summary: initialIssue.summary,
        description: initialIssue.description,
        columnId: initialIssue.columnId,
        priority: initialIssue.priority,
        type: initialIssue.type as IssueType,
        sprintId: initialIssue.sprintId || "",
        assigneeId: initialIssue.assigneeId || "",
        attachments: initialIssue.attachments || [],
      });
    } else if (columns.length > 0 && !columnId) {
      // Set default column
      setValue("columnId", columns[0].id);
    }
  }, [isEditing, initialIssue, columns, reset, setValue, columnId]);

  // Set sprint ID from props
  useEffect(() => {
    if (sprintId) {
      setValue("sprintId", sprintId);
      setSelectedSprintId(sprintId);
    }
  }, [sprintId, setValue]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  }, []);

  const onSubmit = handleSubmit(async (data: IssueFormInputs) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && initialIssue) {
        const updateData: UpdateIssueParams = {
          title: data.title,
          summary: data.summary,
          description: data.description,
          columnId: data.columnId,
          priority: data.priority,
          sprintId: data.sprintId || null,
          assigneeId: data.assigneeId || null,
        };

        await updateIssue(projectId, initialIssue.id, updateData);
        toast.success("Issue updated successfully!");
      } else {
        const createData: CreateIssueParams = {
          projectId,
          title: data.title,
          summary: data.summary,
          description: data.description,
          columnId: data.columnId,
          priority: data.priority,
          type: data.type,
          reporterId: currentProject?.ownerId || "",
          assigneeId: data.assigneeId || null,
          sprintId: data.sprintId || null,
          dueDateFrom: null,
          dueDateTo: null,
          storyPoint: 0,
        };

        await createIssue(createData);
        toast.success("Issue created successfully!");
      }

      onClose();
      reset();
    } catch (error) {
      console.error("Error creating/updating issue:", error);
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} issue: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
      setFiles([]);
    }
  });

  if (!isOpen || !projectId) return null;

  return (
    <Modal
      title={isEditing ? "Update Issue" : "Create Issue"}
      onClose={onClose}
      buttonContent={isLoading ? "Loading..." : isEditing ? "Update Issue" : "Create Issue"}
      onSubmit={onSubmit}
      className="w-[600px]"
      isLoadingButton={isLoading}
      isSubmitDisabled={columns.length === 0}
    >
      <div className="max-h-[calc(100vh-200px)] overflow-auto p-4">
        <form className="space-y-4">
          <div className="mb-6 space-y-4">
            {/* Project Display */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Project</label>
              <div className="rounded-md bg-gray-50 px-3 py-2">
                <span className="text-gray-900">{currentProject?.name}</span>
              </div>
            </div>

            {/* Sprint Selection */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sprint (Optional)</label>
              <Dropdown
                options={[
                  { value: "", label: "None (Backlog)" },
                  ...sprints.map((sprint) => ({ value: sprint.id, label: sprint.name })),
                ]}
                selectedValue={watch("sprintId") || ""}
                onChange={(value) => {
                  setValue("sprintId", value);
                  setSelectedSprintId(value || undefined);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={ISSUE_TYPES.map((type) => ({
                  value: type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                }))}
                selectedValue={type}
                onChange={(value) => setValue("type", value as IssueType)}
              />
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
            </div>

            <div>
              <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={ISSUE_PRIORITIES.map((priority) => ({
                  value: priority,
                  label: priority.charAt(0).toUpperCase() + priority.slice(1),
                }))}
                selectedValue={priority}
                onChange={(value) => setValue("priority", value as IssuePriority)}
              />
              {errors.priority && <p className="mt-1 text-sm text-red-500">{errors.priority.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter issue title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="summary" className="mb-1 block text-sm font-medium text-gray-700">
              Summary <span className="text-red-500">*</span>
            </label>
            <input
              id="summary"
              type="text"
              {...register("summary")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Brief summary of the issue"
            />
            {errors.summary && <p className="mt-1 text-sm text-red-500">{errors.summary.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Detailed description of the issue"
            />
          </div>

          <div>
            <label htmlFor="column" className="mb-1 block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={columns.map((column) => ({ value: column.id, label: column.name }))}
              selectedValue={columnId}
              onChange={(value) => setValue("columnId", value)}
            />
            {errors.columnId && <p className="mt-1 text-sm text-red-500">{errors.columnId.message}</p>}
          </div>

          <div>
            <label htmlFor="assignee" className="mb-1 block text-sm font-medium text-gray-700">
              Assignee (Optional)
            </label>
            <Dropdown
              options={[
                { value: "", label: "Unassigned" },
                // In real app, you would fetch actual project members
                { value: "user1", label: "User 1" },
                { value: "user2", label: "User 2" },
              ]}
              selectedValue={watch("assigneeId") || ""}
              onChange={(value) => setValue("assigneeId", value)}
              renderSelected={(value) =>
                value ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar userId={value} size={24} isDisplayName={false} />
                    <span>{value === "user1" ? "User 1" : "User 2"}</span>
                  </div>
                ) : (
                  "Unassigned"
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Attachments</label>
            <div
              className={`cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors ${
                files.length ? "border-blue-500 bg-blue-50" : "hover:border-blue-500 hover:bg-blue-50"
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <p>
                {files.length
                  ? "Drop files here or click to replace"
                  : "Drag & drop files here, or click to select files"}
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-2">
                <ul className="list-disc pl-5">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateIssueModal;
