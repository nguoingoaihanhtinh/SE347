export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-600">Quản lý và tạo mới dự án</p>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        Chưa có danh sách project. Hãy bắt đầu bằng việc tạo một project mới.
      </div>
    </div>
  );
}


