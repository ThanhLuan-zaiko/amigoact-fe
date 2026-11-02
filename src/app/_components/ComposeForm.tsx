import Link from "next/link";
import {
  FiBell,
  FiImage,
  FiList,
  FiMessageCircle,
  FiMessageSquare,
  FiMinus,
  FiSave,
  FiSend,
  FiType,
  FiVideo,
  FiX,
} from "react-icons/fi";
import {
  chipButton,
  chipPressed,
  fieldLabel,
  iconButton,
  inputField,
  mutedText,
  panel,
  primaryButton,
} from "./ui";

const TOOLBAR = [
  { label: "Tiêu đề", icon: FiType },
  { label: "Trích dẫn", icon: FiMessageSquare },
  { label: "Danh sách", icon: FiList },
  { label: "Ảnh", icon: FiImage },
  { label: "Video", icon: FiVideo },
  { label: "Đường kẻ", icon: FiMinus },
];

const toolbarButton =
  "inline-flex h-9 w-10 items-center justify-center border-r border-slate-200 text-sm text-slate-700 transition-colors last:border-r-0 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:text-teal-400 dark:focus-visible:outline-teal-400";

export default function ComposeForm() {
  return (
    <section className={`${panel} flex flex-col gap-5 p-4 sm:p-6`}>
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="flex-1 text-xl font-extrabold tracking-tight">
          Tạo bài viết
        </h1>
        <Link href="/" aria-label="Đóng" className={iconButton}>
          <FiX aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Đăng dưới</span>
          <select className={inputField} defaultValue="">
            <option value="" disabled>
              Chọn tổ chức
            </option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Hiển thị</span>
          <select className={inputField} defaultValue="public">
            <option value="public">Công khai</option>
            <option value="members">Chỉ thành viên</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>Loại bài</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed="true" className={chipPressed}>
            <FiBell aria-hidden="true" />
            Thông báo
          </button>
          <button type="button" aria-pressed="false" className={chipButton}>
            <FiMessageCircle aria-hidden="true" />
            Thảo luận
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className={fieldLabel}>Tiêu đề</span>
        <input
          type="text"
          placeholder="Tiêu đề bài viết"
          className={inputField}
        />
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex w-fit flex-wrap overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
          {TOOLBAR.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              className={toolbarButton}
            >
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
        <textarea
          rows={8}
          placeholder="Nội dung bài viết…"
          className={`${inputField} resize-y leading-relaxed`}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className={fieldLabel}>Thẻ (tối đa 3)</span>
        <input
          type="text"
          placeholder="Nhập thẻ, cách nhau bằng dấu phẩy"
          className={inputField}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <span className={`${mutedText} flex-1`}>
          Bài nháp chỉ bạn nhìn thấy.
        </span>
        <button
          type="button"
          aria-label="Lưu nháp"
          title="Lưu nháp"
          className={iconButton}
        >
          <FiSave aria-hidden="true" />
        </button>
        <button type="button" className={primaryButton}>
          <FiSend aria-hidden="true" />
          Đăng bài
        </button>
      </div>
    </section>
  );
}
