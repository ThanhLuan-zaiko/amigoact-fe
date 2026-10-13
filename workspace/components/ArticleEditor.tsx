import type { ReactElement } from "react";
import { Section } from "../../core/components/Section.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { OrgPost } from "../board-api.ts";
import { useArticleEditor } from "../editor-hooks.ts";
import { BlockEditor } from "./BlockEditor.tsx";
import { BlockInserter } from "./BlockInserter.tsx";
import { PublishPanel } from "./PublishPanel.tsx";

interface ArticleEditorProps {
  orgId: string;
  initial: OrgPost | null;
  canAnnounce: boolean;
  onPublished: (post: OrgPost) => void;
}

// Two-column writing desk: the article body (title + block list with
// insert seams) on the left, the publish rail on the right.
export function ArticleEditor({
  orgId,
  initial,
  canAnnounce,
  onPublished,
}: ArticleEditorProps): ReactElement {
  const editor = useArticleEditor(orgId, initial, onPublished, canAnnounce);
  return (
    <>
      <Section>
        <div data-rise>
          <TextField
            label="Tiêu đề bài viết"
            name="article-title"
            value={editor.title}
            onChange={(event) => editor.setTitle(event.target.value)}
            placeholder="Tiêu đề thu hút người đọc…"
            maxLength={200}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3" aria-label="Nội dung bài viết">
          <BlockInserter
            index={0}
            onInsert={editor.insertBlock}
            onMedia={(index, family, files) =>
              void editor.insertMedia(index, family, files)
            }
          />
          {editor.blocks.map((block, index) => (
            <div key={block.key} className="flex flex-col gap-3">
              <BlockEditor
                block={block}
                index={index}
                total={editor.blocks.length}
                lookup={editor.lookup}
                upload={editor.uploads[block.key]}
                focused={editor.focusKey === block.key}
                onPatch={editor.patchBlock}
                onReplaceMedia={(key, file) => void editor.replaceMedia(key, file)}
                onMove={editor.moveBlock}
                onRemove={editor.removeBlock}
              />
              <BlockInserter
                index={index + 1}
                onInsert={editor.insertBlock}
                onMedia={(at, family, files) =>
                  void editor.insertMedia(at, family, files)
                }
              />
            </div>
          ))}
        </div>
      </Section>
      <PublishPanel editor={editor} orgId={orgId} canAnnounce={canAnnounce} />
    </>
  );
}
