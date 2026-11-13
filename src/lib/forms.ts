// Pure helpers for account forms. Text shown to users stays in Vietnamese.
import type { FieldErrors, FormState } from "./account";
import { FIELD_MESSAGES, PASSWORD_HINT } from "./validation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  account_disabled: "Tài khoản này đã bị khóa.",
  email_taken: "Email này đã được sử dụng.",
  phone_taken: "Số điện thoại này đã được sử dụng.",
  rate_limited: "Bạn thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.",
  invalid_current_password: "Mật khẩu hiện tại không đúng.",
  same_password: "Mật khẩu mới phải khác mật khẩu hiện tại.",
  invalid_or_expired_token: "Liên kết không hợp lệ hoặc đã hết hạn.",
  email_already_verified: "Email này đã được xác minh.",
  business_fields_required:
    "Tài khoản tổ chức cần có tên đơn vị và mã số thuế.",
  session_not_found: "Không tìm thấy phiên đăng nhập này.",
  network_error: "Không kết nối được máy chủ. Vui lòng thử lại.",
  validation_error: "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.",
  password_personal:
    "Mật khẩu không được chứa tên hoặc phần tên trong email của bạn.",
  file_empty: "Hãy chọn một ảnh để tải lên.",
  file_too_large: "Ảnh tối đa 20 MB. Hãy chọn ảnh nhỏ hơn.",
  unsupported_media_type: "Ảnh phải là JPEG, PNG hoặc WEBP.",
  video_too_large: "Video tối đa 50 MB. Hãy chọn video nhỏ hơn.",
  gallery_full: "Bộ sưu tập tối đa 10 tệp. Hãy gỡ bớt trước khi thêm.",
  media_not_found: "Không tìm thấy ảnh này. Hãy chọn lại ảnh.",
  organization_not_found: "Không tìm thấy tổ chức này.",
  organization_forbidden: "Bạn không có quyền thực hiện việc này.",
  email_not_verified: "Hãy xác minh email trước khi tạo tổ chức.",
  organization_limit_reached: "Bạn đã sở hữu số tổ chức tối đa (5 tổ chức).",
  organization_has_open_activities:
    "Tổ chức còn hoạt động đang mở. Hãy hủy các hoạt động đó trước khi xóa tổ chức.",
  organization_has_certificates:
    "Tổ chức đã cấp chứng nhận cho sinh viên nên không thể xóa vĩnh viễn. Chứng nhận là bằng chứng của sinh viên.",
  organization_has_pending_hours:
    "Tổ chức còn giờ tình nguyện đang chờ duyệt. Hãy duyệt hoặc từ chối các giờ đó trước khi xóa vĩnh viễn.",
  slug_taken:
    "Đường dẫn cũ của tổ chức này đã có tổ chức khác dùng, nên chưa khôi phục được.",
  already_member: "Bạn đã là thành viên của tổ chức này.",
  already_applied: "Bạn đã gửi yêu cầu tham gia tổ chức này.",
  application_cooldown:
    "Yêu cầu trước đã bị từ chối. Bạn chưa thể gửi lại lúc này.",
  membership_suspended: "Tư cách thành viên của bạn đang bị tạm ngưng.",
  owner_cannot_leave: "Chủ sở hữu không thể rời tổ chức.",
  not_a_member: "Bạn không còn là thành viên của tổ chức này.",
  application_not_found: "Yêu cầu này không còn chờ duyệt.",
  member_not_found: "Người này không còn là thành viên.",
  owner_role_locked: "Không thể đổi vai trò của chủ sở hữu.",
  owner_cannot_be_removed: "Không thể xóa chủ sở hữu khỏi tổ chức.",
  cannot_remove_self: "Bạn không thể tự xóa mình. Hãy chọn rời tổ chức.",
  activity_not_found: "Không tìm thấy hoạt động này.",
  activity_not_in_trash: "Hoạt động này không nằm trong thùng rác.",
  activity_not_editable: "Hoạt động ở trạng thái này không sửa được nữa.",
  activity_not_draft: "Chỉ xóa được bản nháp. Hoạt động đã đăng thì hãy hủy.",
  activity_not_started: "Hoạt động chưa bắt đầu nên chưa thể kết thúc.",
  activity_not_open: "Hoạt động này chưa mở đăng ký.",
  activity_has_registrations:
    "Đã có người đăng ký cả hoạt động nên không thể thêm ca.",
  registration_closed: "Đã đóng đăng ký cho hoạt động này.",
  already_registered: "Bạn đã đăng ký rồi.",
  registration_rejected: "Đăng ký của bạn đã bị từ chối.",
  registration_not_found: "Không tìm thấy đăng ký này.",
  registration_not_active: "Đăng ký này không còn hiệu lực.",
  registration_not_pending: "Đăng ký này không còn chờ duyệt.",
  shift_not_found: "Không tìm thấy ca này.",
  shift_overlap: "Ca này trùng giờ với ca bạn đã đăng ký.",
  shift_has_registrations: "Ca đã có người đăng ký nên không xóa được.",
  session_already_open: "Đang có một phiên điểm danh mở cho mục này.",
  attendance_session_not_found: "Không tìm thấy phiên điểm danh này.",
  record_not_found: "Không tìm thấy lượt điểm danh này.",
  checkin_code_invalid: "Mã điểm danh không đúng.",
  checkin_session_closed: "Phiên điểm danh này đã đóng.",
  not_registered_for_session:
    "Bạn chưa có đăng ký được duyệt cho phiên điểm danh này.",
  already_checked_in: "Đã điểm danh rồi.",
  attendance_pending_review:
    "Còn mã nhập tay chưa xác nhận. Hãy xử lý trước khi kết thúc.",
  hours_required:
    "Hãy nhập số giờ tình nguyện cho hoạt động trước khi kết thúc.",
  hours_not_found: "Người này chưa có giờ ở hoạt động này.",
  hours_would_go_negative: "Số giờ sau khi điều chỉnh không được âm.",
  appeal_not_allowed: "Chỉ khiếu nại được sau khi hoạt động bắt đầu.",
  appeal_already_pending: "Bạn đã có một khiếu nại đang chờ xử lý.",
  appeal_not_found: "Không tìm thấy khiếu nại này.",
  appeal_not_pending: "Khiếu nại này đã được xử lý.",
  post_forbidden: "Bạn không có quyền đăng loại bài này trong tổ chức đã chọn.",
  post_not_found: "Không tìm thấy bài viết này.",
  post_not_draft: "Bài này đã được đăng rồi.",
  post_not_published: "Bài này chưa được đăng.",
  post_not_in_trash: "Bài này không còn trong thùng rác.",
  comment_forbidden: "Bạn không có quyền với bình luận này.",
  comment_not_found: "Không tìm thấy bình luận này.",
  comment_edit_expired: "Chỉ sửa được bình luận trong 15 phút sau khi viết.",
  comment_not_deleted: "Bình luận này chưa bị xóa.",
  role_not_found: "Không tìm thấy vai trò này.",
  role_hierarchy: "Bạn chỉ thay đổi được vai trò và người ở bậc thấp hơn mình.",
  permission_not_held: "Bạn không thể cấp quyền mà chính mình không có.",
  role_limit_reached: "Mỗi tổ chức có tối đa 25 vai trò.",
  role_name_taken: "Đã có vai trò mang tên này.",
  role_order_invalid: "Thứ tự vai trò đã thay đổi. Hãy tải lại trang.",
};

const PASSWORD_COMMON =
  "Mật khẩu này quá phổ biến. Hãy chọn mật khẩu khó đoán hơn.";
const PASSWORD_PERSONAL =
  "Mật khẩu không được chứa tên hoặc phần tên trong email của bạn.";

const ISSUE_MESSAGES: Record<string, string> = {
  required: FIELD_MESSAGES.required,
  missing: FIELD_MESSAGES.required,
  // A required field left empty reaches the backend as null.
  string_type: FIELD_MESSAGES.required,
  phone_invalid: FIELD_MESSAGES.phone,
  tax_code_invalid: FIELD_MESSAGES.taxCode,
  legal_id_invalid: FIELD_MESSAGES.legalId,
  birth_date_invalid: FIELD_MESSAGES.birthDate,
  password_too_weak: PASSWORD_HINT,
  password_common: PASSWORD_COMMON,
  password_personal: PASSWORD_PERSONAL,
  website_invalid: "Website cần bắt đầu bằng http:// hoặc https://.",
  organization_name_invalid: FIELD_MESSAGES.organizationName,
  text_invalid: "Nội dung có ký tự không hợp lệ. Vui lòng nhập lại.",
  title_invalid: FIELD_MESSAGES.activityTitle,
  end_before_start: "Thời gian kết thúc phải sau thời gian bắt đầu.",
  deadline_after_start: "Hạn đăng ký không được sau thời gian bắt đầu.",
  start_in_past: "Thời gian bắt đầu phải ở tương lai.",
  deadline_in_past: "Hạn đăng ký phải ở tương lai.",
  shift_outside_activity: "Ca phải nằm trong thời gian của hoạt động.",
  activity_time_excludes_shift: "Thời gian mới không còn chứa các ca đã tạo.",
  capacity_below_registered: "Số chỗ không được ít hơn số người đã đăng ký.",
  shift_required: "Hãy chọn một ca.",
  delta_zero: FIELD_MESSAGES.deltaHours,
  checkin_input_required: FIELD_MESSAGES.checkInCode,
  registration_required: "Hãy chọn ca cần xác nhận.",
  too_many_tags: "Mỗi bài có tối đa 5 thẻ.",
  tag_invalid: "Thẻ cần có ít nhất một chữ hoặc số.",
  activity_not_linkable:
    "Không gắn được hoạt động này. Hãy chọn hoạt động đã đăng của tổ chức.",
  members_post_has_no_media:
    "Bài chỉ dành cho thành viên không có ảnh hoặc video.",
  text_needs_letter: FIELD_MESSAGES.needsLetter,
  bool_type: "Giá trị không hợp lệ. Vui lòng chọn lại.",
};

// A number of the wrong shape. The field message says the range, so it wins when present.
const NUMBER_ISSUES = new Set(["int_type", "float_type", "number_invalid"]);

// Used when the issue type is generic, such as a value that is too short.
const FIELD_FALLBACKS: Record<string, string> = {
  email: FIELD_MESSAGES.email,
  password: PASSWORD_HINT,
  new_password: PASSWORD_HINT,
  full_name: "Họ và tên cần từ 1 đến 120 ký tự.",
  phone: FIELD_MESSAGES.phone,
  tax_code: FIELD_MESSAGES.taxCode,
  legal_rep_id: FIELD_MESSAGES.legalId,
  date_of_birth: FIELD_MESSAGES.birthDate,
  company_name: "Tên đơn vị cần từ 1 đến 200 ký tự.",
  legal_name: "Tên pháp lý tối đa 200 ký tự.",
  license_number: "Số giấy phép tối đa 200 ký tự.",
  legal_rep_name: "Tên người đại diện tối đa 200 ký tự.",
  legal_rep_position: "Chức vụ tối đa 200 ký tự.",
  address: "Địa chỉ tối đa 500 ký tự.",
  name: FIELD_MESSAGES.organizationName,
  description: "Mô tả tối đa 2000 ký tự.",
  org_type: "Vui lòng chọn loại tổ chức trong danh sách.",
  join_policy: "Vui lòng chọn cách tham gia trong danh sách.",
  website: "Website tối đa 300 ký tự.",
  city: "Thành phố tối đa 120 ký tự.",
  message: "Lời nhắn tối đa 1000 ký tự.",
  title: FIELD_MESSAGES.activityTitle,
  shift_title: "Tên ca cần từ 1 đến 120 ký tự.",
  location: "Địa điểm tối đa 200 ký tự.",
  start_at: "Thời gian không hợp lệ.",
  end_at: "Thời gian không hợp lệ.",
  registration_deadline: "Thời gian không hợp lệ.",
  capacity: FIELD_MESSAGES.capacity,
  max_participants: FIELD_MESSAGES.capacity,
  hours_awarded: FIELD_MESSAGES.hours,
  code: FIELD_MESSAGES.checkInCode,
  reason: "Lý do cần từ 5 đến 1000 ký tự.",
  delta_hours: FIELD_MESSAGES.deltaHours,
  multiplier: FIELD_MESSAGES.multiplier,
  cap_hours: FIELD_MESSAGES.capHours,
  org_slug: "Hãy chọn tổ chức để đăng bài.",
  post_title: "Tiêu đề cần từ 1 đến 160 ký tự.",
  post_body: "Nội dung cần từ 1 đến 5000 ký tự.",
  post_tags: "Mỗi thẻ tối đa 40 ký tự.",
  minutes: "Thời lượng từ 5 đến 1440 phút.",
  role_name: "Tên vai trò cần từ 1 đến 50 ký tự và có chữ cái.",
  role_color: "Hãy chọn một màu trong danh sách.",
  role_permissions: "Danh sách quyền không hợp lệ.",
};

// Backend errors that belong to specific inputs. A form renders only some of them.
const CODE_FIELDS: Record<string, string[]> = {
  email_taken: ["email"],
  phone_taken: ["phone"],
  invalid_current_password: ["current_password", "password"],
  same_password: ["new_password"],
  password_personal: ["new_password", "password"],
  business_fields_required: ["company_name", "tax_code"],
};

export type ValidationIssue = {
  field: string;
  type: string;
};

// Reads an upload error in the browser, where no form state is involved.
export function uploadMessage(code: string): string {
  return errorMessage(code);
}

function errorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export function failureState(
  code: string,
  issues: ValidationIssue[] = [],
): FormState {
  const fields = CODE_FIELDS[code];
  if (fields) {
    return {
      fieldErrors: Object.fromEntries(
        fields.map((field) => [field, errorMessage(code)]),
      ),
    };
  }
  const fieldErrors: FieldErrors = {};
  for (const { field, type } of issues) {
    const message = NUMBER_ISSUES.has(type)
      ? (FIELD_FALLBACKS[field] ?? FIELD_MESSAGES.number)
      : (ISSUE_MESSAGES[type] ?? FIELD_FALLBACKS[field]);
    if (!message) {
      return { error: errorMessage(code) };
    }
    fieldErrors[field] = message;
  }
  return issues.length > 0 ? { fieldErrors } : { error: errorMessage(code) };
}

export function textValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Passwords may contain meaningful spaces, so they are not trimmed.
export function passwordValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function textOrNull(formData: FormData, name: string): string | null {
  return textValue(formData, name) || null;
}

// Only same-site paths are accepted, so a crafted link cannot redirect elsewhere after login.
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  return value;
}

export function describeDevice(userAgent: string | null): string {
  if (!userAgent) {
    return "Thiết bị không xác định";
  }
  const browsers: [RegExp, string][] = [
    [/Edg\//, "Edge"],
    [/OPR\//, "Opera"],
    [/Chrome\//, "Chrome"],
    [/Firefox\//, "Firefox"],
    [/Safari\//, "Safari"],
  ];
  const systems: [RegExp, string][] = [
    [/Android/, "Android"],
    [/iPhone|iPad/, "iOS"],
    [/Windows/, "Windows"],
    [/Mac OS X/, "macOS"],
    [/Linux/, "Linux"],
  ];
  const browser = browsers.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = systems.find(([pattern]) => pattern.test(userAgent))?.[1];
  return (
    [browser, system].filter(Boolean).join(" trên ") ||
    "Thiết bị không xác định"
  );
}
