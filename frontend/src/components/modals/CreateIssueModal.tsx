// src/components/projects/modals/CreateIssueModal.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Modal from "../ui/modal/Modal";
import UserAvatar from "../ui/user/userAvatar";
import { extractErrorMessage } from "../../types/api";

import type { IIssue, UpdateIssueParams } from "../../types/issue";
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
  defaultColumnId?: string;
  onSuccess?: () => void; // Callback sau khi tạo thành công
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
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  storyPoint: z.number().int().min(0).default(0),
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
  defaultColumnId,
  onSuccess,
}: CreateIssueModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject } = useProjectStore();
  const { columns, fetchColumns } = useColumnStore();
  const { sprints, fetchSprintsByProject } = useSprintStore();
  const { createIssue, updateIssue } = useIssueStore();
  const [, setSelectedSprintId] = useState<string | undefined>(sprintId);
  const [files, setFiles] = useState<File[]>([]);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Compact mode: when opened from column footer (has defaultColumnId) and not editing
  const isCompactMode = !!defaultColumnId && !isEditing;

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
      dueDateFrom: "",
      dueDateTo: "",
      storyPoint: 0,
    },
  });

  const columnId = watch("columnId");
  const priority = watch("priority");
  const type = watch("type");
  const dueDateFrom = watch("dueDateFrom");
  const dueDateTo = watch("dueDateTo");

  useEffect(() => {
    if (!isOpen || !projectId) return;

    // Only fetch if columns are empty or don't match current project
    const loadData = async () => {
      try {
        // Check if we already have columns for this project
        if (columns.length === 0 || columns[0]?.projectId !== projectId) {
          await fetchColumns(projectId);
        }
        // Always fetch sprints as they can change
        await fetchSprintsByProject(projectId);
      } catch (error) {
        console.error("Failed to load project data:", error);
      }
    };

    loadData();
  }, [fetchColumns, fetchSprintsByProject, isOpen, projectId, columns]);

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
        dueDateFrom: initialIssue.dueDateFrom ? new Date(initialIssue.dueDateFrom).toISOString().split("T")[0] : "",
        dueDateTo: initialIssue.dueDateTo ? new Date(initialIssue.dueDateTo).toISOString().split("T")[0] : "",
        storyPoint: initialIssue.storyPoint || 0,
      });
    } else if (columns.length > 0 && !columnId) {
      setValue("columnId", columns[0].id);
    }
  }, [isEditing, initialIssue, columns, reset, setValue, columnId]);

  useEffect(() => {
    if (sprintId) {
      setValue("sprintId", sprintId);
      setSelectedSprintId(sprintId);
    }
  }, [sprintId, setValue]);

  // When opening from a specific sprint card, pre-select that sprint in the dropdown
  useEffect(() => {
    if (defaultSprintId && isOpen) {
      setValue("sprintId", defaultSprintId);
      setSelectedSprintId(defaultSprintId);
    }
  }, [defaultSprintId, isOpen, setValue]);

  // When opening from a specific column, pre-select that status in the dropdown
  useEffect(() => {
    if (defaultColumnId && isOpen && !isEditing) {
      setValue("columnId", defaultColumnId);
    }
  }, [defaultColumnId, isOpen, isEditing, setValue]);

  // Auto-focus title input in compact mode
  useEffect(() => {
    if (isOpen && isCompactMode && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isCompactMode]);

  // Auto-set summary = title in compact mode when title changes
  const titleValue = watch("title");
  const summaryValue = watch("summary");
  useEffect(() => {
    if (isCompactMode && isOpen && titleValue && !summaryValue) {
      setValue("summary", titleValue);
    }
  }, [titleValue, summaryValue, isCompactMode, isOpen, setValue]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanData = (data: any) => {
    const result = { ...data };
    Object.keys(result).forEach((key) => {
      if (result[key] === null || result[key] === undefined || result[key] === "") {
        delete result[key];
      }
    });
    return result;
  };

  const onSubmit = handleSubmit(async (data: IssueFormInputs) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    // In compact mode, ensure summary is set (default to title if empty)
    if (isCompactMode && !data.summary) {
      data.summary = data.title;
    }

    setIsLoading(true);

    try {
      const formattedDueDateFrom = dueDateFrom ? new Date(dueDateFrom).toISOString() : null;
      const formattedDueDateTo = dueDateTo ? new Date(dueDateTo).toISOString() : null;

      if (isEditing && initialIssue) {
        const updateData: UpdateIssueParams = {
          title: data.title,
          summary: data.summary,
          description: data.description,
          columnId: data.columnId,
          priority: data.priority,
          sprintId: data.sprintId || null,
          assigneeId: data.assigneeId || null,
          dueDateFrom: formattedDueDateFrom,
          dueDateTo: formattedDueDateTo,
          storyPoint: data.storyPoint,
        };

        await updateIssue(projectId, initialIssue.id, updateData);
        toast.success("Issue updated successfully!");
      } else {
        const cleanedData = cleanData({
          title: data.title,
          summary: data.summary,
          description: data.description,
          columnId: data.columnId,
          priority: data.priority,
          type: data.type,
          projectId: projectId,
          reporterId: currentProject?.ownerId || "",
          assigneeId: data.assigneeId || null,
          sprintId: data.sprintId || null,
          dueDateFrom: formattedDueDateFrom,
          dueDateTo: formattedDueDateTo,
          storyPoint: data.storyPoint,
        });

        await createIssue(cleanedData);
        toast.success("Issue created successfully!");

        // ✅ GỌI CALLBACK SAU KHI TẠO THÀNH CÔNG
        if (onSuccess) {
          onSuccess();
        }
      }

      onClose();
      reset();
    } catch (error) {
      console.error("Error creating/updating issue:", error);
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} issue: ${extractErrorMessage(error)}`,
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
      className={isCompactMode ? "max-w-lg w-full" : "max-w-3xl w-full"}
      isLoadingButton={isLoading}
      isSubmitDisabled={columns.length === 0}
    >
      <div className="p-4">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}>
          {!isCompactMode && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Project</label>
                <div className="rounded-md bg-gray-50 px-3 py-2">
                  <span className="text-gray-900">{currentProject?.name}</span>
                </div>
              </div>

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
          )}

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              ref={(e) => {
                register("title").ref(e);
                titleInputRef.current = e;
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter issue title"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && isCompactMode) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
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

          {!isCompactMode && (
            <>
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
            </>
          )}

          {!isCompactMode && (
            <div className="grid grid-cols-2 gap-4">
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
                <label htmlFor="storyPoint" className="mb-1 block text-sm font-medium text-gray-700">
                  Story Point
                </label>
                <input
                  id="storyPoint"
                  type="number"
                  min="0"
                  {...register("storyPoint", { valueAsNumber: true })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* More Details collapsible section for compact mode */}
          {isCompactMode && (
            <div>
              <button
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>{showMoreDetails ? "−" : "+"}</span>
                <span>More Details</span>
              </button>
              {showMoreDetails && (
                <div className="mt-3 space-y-4 pt-3 border-t border-gray-200">
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
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Detailed description of the issue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="storyPoint" className="mb-1 block text-sm font-medium text-gray-700">
                        Story Point
                      </label>
                      <input
                        id="storyPoint"
                        type="number"
                        min="0"
                        {...register("storyPoint", { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>

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
                      <label htmlFor="dueDateFrom" className="mb-1 block text-sm font-medium text-gray-700">
                        Due Date From
                      </label>
                      <input
                        id="dueDateFrom"
                        type="date"
                        {...register("dueDateFrom")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="dueDateTo" className="mb-1 block text-sm font-medium text-gray-700">
                        Due Date To
                      </label>
                      <input
                        id="dueDateTo"
                        type="date"
                        {...register("dueDateTo")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assignee" className="mb-1 block text-sm font-medium text-gray-700">
                      Assignee (Optional)
                    </label>
                    <Dropdown
                      options={[
                        { value: "", label: "Unassigned" },
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
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CreateIssueModal;
