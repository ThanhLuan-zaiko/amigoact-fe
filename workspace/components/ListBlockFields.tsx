import type { ReactElement } from "react";
import { FiList, FiTrash2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { EditorBlock } from "../article.ts";

interface ListBlockFieldsProps {
  block: EditorBlock & { type: "list" };
  focused: boolean;
  onPatch: (key: string, patch: Partial<EditorBlock>) => void;
}

// Ordered/unordered list block fields: style toggle plus one TextField
// per item with add/remove item controls.
export function ListBlockFields({
  block,
  focused,
  onPatch,
}: ListBlockFieldsProps): ReactElement {
  function setItems(items: string[]): void {
    onPatch(block.key, { items });
  }
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Kiểu danh sách" className="flex gap-2">
        <Button
          type="button"
          variant={block.ordered ? "secondary" : "primary"}
          onClick={() => onPatch(block.key, { ordered: false })}
          aria-pressed={!block.ordered}
        >
          Gạch đầu dòng
        </Button>
        <Button
          type="button"
          variant={block.ordered ? "primary" : "secondary"}
          onClick={() => onPatch(block.key, { ordered: true })}
          aria-pressed={block.ordered}
        >
          Đánh số
        </Button>
      </div>
      {block.items.map((item, index) => (
        <div key={index} className="flex items-end gap-2">
          <TextField
            className="flex-1"
            label={`Mục ${index + 1}`}
            name={`item-${block.key}-${index}`}
            value={item}
            autoFocus={focused && index === block.items.length - 1}
            onChange={(event) =>
              setItems(
                block.items.map((cur, i) =>
                  i === index ? event.target.value : cur,
                ),
              )
            }
            placeholder="Nội dung mục…"
            maxLength={300}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              setItems(
                block.items.length > 1
                  ? block.items.filter((_, i) => i !== index)
                  : [""],
              )
            }
            aria-label={`Xóa mục ${index + 1}`}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setItems([...block.items, ""])}
          icon={<FiList className="h-4 w-4" aria-hidden="true" />}
        >
          Thêm mục
        </Button>
      </div>
    </div>
  );
}
