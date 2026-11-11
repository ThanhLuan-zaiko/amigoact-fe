import { FiSearch } from "react-icons/fi";
import { fieldLabel, inputField, primaryButton } from "../ui";

// A plain GET form, so it works without JavaScript. The page turns the query into
// the address of the certificate.
export default function VerifyForm({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  return (
    <form
      action="/certificates/verify"
      method="get"
      className="flex flex-wrap items-end gap-3"
    >
      <label className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
        <span className={fieldLabel}>Số serial</span>
        <input
          name="serial"
          defaultValue={defaultValue}
          placeholder="AMG-XXXX-XXXX-XXXX"
          autoComplete="off"
          maxLength={60}
          required
          className={`${inputField} font-mono uppercase`}
        />
      </label>
      <button type="submit" className={primaryButton}>
        <FiSearch aria-hidden="true" />
        Xác minh
      </button>
    </form>
  );
}
