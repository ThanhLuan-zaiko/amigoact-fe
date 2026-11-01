import { FormMessage } from "./FormParts";

export default function MissingToken() {
  return (
    <FormMessage state={{ error: "Liên kết không hợp lệ hoặc đã hết hạn." }} />
  );
}
