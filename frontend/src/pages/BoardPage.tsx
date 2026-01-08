
export default function BoardPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Board</h1>
        <p className="text-sm text-slate-600">Tính năng board đang được xây dựng.</p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        Sẽ có danh sách cột và drag & drop issue ở đây.
      </div>
    </div>
  );
}

