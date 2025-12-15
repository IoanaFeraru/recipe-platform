import Tag from "@/components/Tag/Tag";

interface Props {
  tags: string[];
  onClick?: (tag: string) => void;
}

export function RecipeTags({ tags, onClick }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 3).map((tag, i) => (
        <Tag
          key={i}
          label={tag}
          onClick={() => onClick?.(tag)}
          bgColor="var(--color-bg-secondary)"
        />
      ))}
      {tags.length > 3 && (
        <span className="text-xs text-(--color-text-muted)">
          +{tags.length - 3}
        </span>
      )}
    </div>
  );
}
