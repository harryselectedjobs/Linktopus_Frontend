import VariationCard from "./VariationCard";

export default function PostVariations({ posts, onShare, onSchedule }) {
  const firstRow = posts.slice(0, 2);
  const moreRow = posts.slice(2);

  return (
    <div className="ml-[38px] flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {firstRow.map((post) => (
          <VariationCard
            key={post.variation}
            index={post.variation}
            text={post.post_content}
            onShare={onShare}
            onSchedule={onSchedule}
          />
        ))}
      </div>

      {moreRow.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-surface-border" />
            <span className="section-label !text-[10px] tracking-[0.18em]">
              More variations
            </span>
            <div className="h-px flex-1 bg-surface-border" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {moreRow.map((post) => (
              <VariationCard
                key={post.variation}
                index={post.variation}
                text={post.post_content}
                onShare={onShare}
                onSchedule={onSchedule}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
