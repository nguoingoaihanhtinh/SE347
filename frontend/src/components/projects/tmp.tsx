// const DetailsSection = ({ selectedIssue, onUpdate, isUpdating }: any) => {
//   const handleSave = async (field: string, value: any) => {
//     await onUpdate({ [field]: value });
//   };

//   return (
//     <div className="rounded-lg border border-gray-200 p-4 mb-4 group">
//       <h2 className="text-lg font-semibold text-gray-700 mb-3">Mô tả</h2>
//       <EditableField
//         label="Mô tả chi tiết"
//         value={selectedIssue.description || ""}
//         onSave={(value) => handleSave("description", value)}
//         type="textarea"
//         isUpdating={isUpdating}
//         renderDisplay={(value) => (
//           <p className="text-sm text-gray-700 whitespace-pre-line">{value || "Chưa có mô tả"}</p>
//         )}
//       />
//     </div>
//   );
// };

// const ActivitySection = ({ issueId }: { issueId: string }) => (
//   <div className="rounded-lg border border-gray-200 p-4">
//     <div className="flex justify-between items-center mb-4">
//       <h2 className="text-lg font-semibold text-gray-700">Hoạt động</h2>
//       <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Xem tất cả</button>
//     </div>
//     <div className="space-y-4 text-sm text-gray-600">Hiện chưa có hoạt động nào được ghi nhận.</div>
//   </div>
// );

// const MetadataSection = ({ selectedIssue, columns, sprints, onUpdate, isUpdating }: any) => {
//   const handleSave = async (field: string, value: any) => {
//     await onUpdate({ [field]: value });
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//       {/* Issue Details */}
//       <div className="rounded-lg border border-gray-200 p-4 group bg-white shadow-sm">
//         <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
//           <span className="mr-2">📋</span> Thông tin issue
//         </h3>
//         <div className="space-y-4">
//           <EditableField
//             label="Loại"
//             value={selectedIssue.type}
//             onSave={(value) => handleSave("type", value)}
//             options={ISSUE_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
//             isUpdating={isUpdating}
//             renderDisplay={(value) => (
//               <div className="flex items-center gap-2">
//                 <div
//                   className={`rounded p-1 ${value === "bug" ? "bg-red-100" : value === "task" ? "bg-blue-100" : value === "story" ? "bg-green-100" : "bg-purple-100"}`}
//                 >
//                   <IconRenderer type={value} className="h-4 w-4" />
//                 </div>
//                 <span className="font-medium capitalize">{value}</span>
//               </div>
//             )}
//           />

//           <EditableField
//             label="Độ ưu tiên"
//             value={selectedIssue.priority}
//             onSave={(value) => handleSave("priority", value)}
//             options={ISSUE_PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
//             isUpdating={isUpdating}
//             renderDisplay={(value) => (
//               <span
//                 className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                   value === "high"
//                     ? "bg-red-100 text-red-800"
//                     : value === "medium"
//                       ? "bg-yellow-100 text-yellow-800"
//                       : "bg-green-100 text-green-800"
//                 }`}
//               >
//                 {value}
//               </span>
//             )}
//           />

//           <EditableField
//             label="Trạng thái"
//             value={selectedIssue.columnId}
//             onSave={(value) => handleSave("columnId", value)}
//             options={columns.map((c: any) => ({ value: c.id, label: c.name }))}
//             isUpdating={isUpdating}
//             renderDisplay={(value) => {
//               const col = columns.find((c: any) => c.id === value);
//               return (
//                 <span
//                   className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                     col?.name === "DONE"
//                       ? "bg-green-100 text-green-800"
//                       : col?.name === "IN PROGRESS"
//                         ? "bg-blue-100 text-blue-800"
//                         : "bg-gray-100 text-gray-800"
//                   }`}
//                 >
//                   {col?.name || "To Do"}
//                 </span>
//               );
//             }}
//           />

//           <EditableField
//             label="Story Points"
//             value={selectedIssue.storyPoint ?? 0}
//             onSave={(value) => handleSave("storyPoint", Number(value))}
//             type="number"
//             isUpdating={isUpdating}
//             renderDisplay={(value) => <span className="font-medium">{value} pts</span>}
//           />

//           <EditableField
//             label="Sprint"
//             value={selectedIssue.sprintId ?? ""}
//             onSave={(value) => handleSave("sprintId", value || null)}
//             options={[{ value: "", label: "Backlog" }, ...sprints.map((s: any) => ({ value: s.id, label: s.name }))]}
//             isUpdating={isUpdating}
//             renderDisplay={(value) => {
//               const sprint = sprints.find((s: any) => s.id === value);
//               return <span className="font-medium">{sprint?.name || "Backlog"}</span>;
//             }}
//           />
//         </div>
//       </div>

//       {/* Timeline */}
//       <div className="rounded-lg border border-gray-200 p-4 group bg-white shadow-sm">
//         <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
//           <span className="mr-2">📅</span> Thời gian
//         </h3>
//         <div className="space-y-3 text-sm">
//           <div>
//             <span className="text-gray-500">Tạo lúc</span>
//             <p className="font-medium">{format(new Date(selectedIssue.createdAt), "dd/MM/yyyy HH:mm")}</p>
//           </div>
//           <div>
//             <span className="text-gray-500">Cập nhật lúc</span>
//             <p className="font-medium">{format(new Date(selectedIssue.updatedAt), "dd/MM/yyyy HH:mm")}</p>
//           </div>

//           <EditableField
//             label="Due Date From"
//             value={selectedIssue.dueDateFrom ? new Date(selectedIssue.dueDateFrom).toISOString().split("T")[0] : ""}
//             onSave={(value) => handleSave("dueDateFrom", value ? new Date(value).toISOString() : null)}
//             type="date"
//             isUpdating={isUpdating}
//             renderDisplay={(v) => (v ? format(new Date(v), "dd/MM/yyyy") : "Chưa đặt")}
//           />

//           <EditableField
//             label="Due Date To"
//             value={selectedIssue.dueDateTo ? new Date(selectedIssue.dueDateTo).toISOString().split("T")[0] : ""}
//             onSave={(value) => handleSave("dueDateTo", value ? new Date(value).toISOString() : null)}
//             type="date"
//             isUpdating={isUpdating}
//             renderDisplay={(v) => (v ? format(new Date(v), "dd/MM/yyyy") : "Chưa đặt")}
//           />
//         </div>
//       </div>

//       {/* People */}
//       <div className="md:col-span-2 rounded-lg border border-gray-200 p-4 group bg-white shadow-sm">
//         <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
//           <span className="mr-2">👥</span> Người liên quan
//         </h3>
//         <div className="space-y-4">
//           <div>
//             <span className="text-xs text-gray-500">Người tạo</span>
//             <div className="mt-1 flex items-center gap-2">
//               <UserAvatar userId={selectedIssue.reporterId} size={28} />
//               <span className="font-medium">{selectedIssue.reporterId || "Unknown"}</span>
//             </div>
//           </div>

//           <EditableField
//             label="Người thực hiện"
//             value={selectedIssue.assigneeId ?? ""}
//             onSave={(value) => handleSave("assigneeId", value || null)}
//             options={[
//               { value: "", label: "Chưa phân công" },
//               // Thêm user thật nếu có API user
//               { value: "user1", label: "User 1" },
//               { value: "user2", label: "User 2" },
//             ]}
//             isUpdating={isUpdating}
//             renderDisplay={(value) =>
//               value ? (
//                 <div className="flex items-center gap-2">
//                   <UserAvatar userId={value} size={28} />
//                   <span className="font-medium">{value}</span>
//                 </div>
//               ) : (
//                 <span className="text-gray-500 italic">Chưa phân công</span>
//               )
//             }
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const CommentSection = () => (
//   <div className="rounded-lg border border-gray-200 p-4">
//     <div className="flex justify-between items-center mb-4">
//       <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
//         <FaRegCommentAlt /> Bình luận
//       </h3>
//       <span className="text-sm text-gray-500">Chưa có bình luận</span>
//     </div>
//     <textarea
//       placeholder="Viết bình luận..."
//       className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//     />
//     <div className="mt-3 flex justify-end">
//       <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Gửi</button>
//     </div>
//   </div>
// );
